import { ApiSearchResponse, ApiSearchResult, Product } from '../types/api';

// Use proxy in development (Vite proxy) and production (PHP proxy or direct API) to avoid CORS issues
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return '/api/nlp/search/';
  }
  // Railway / serverless: use explicit API URL if set (build-time env VITE_API_URL)
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && typeof envApi === 'string') {
    const base = envApi.replace(/\/$/, '');
    return `${base}/nlp/search/`;
  }
  // PHP proxy (e.g. traditional hosting)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${basePath}/api-proxy.php`;
};

const API_BASE_URL = getApiUrl();

/**
 * Transform API response to Product format
 * API returns an array of arrays (groups of results), so we need to flatten it
 */
const transformApiResponseToProducts = (response: ApiSearchResponse): Product[] => {
  const products: Product[] = [];
  
  // Response is an array of arrays (groups)
  // Flatten all groups into a single array of products
  response.forEach((group: ApiSearchResult[]) => {
    if (Array.isArray(group)) {
      group.forEach((result: ApiSearchResult) => {
        if (result && result._source) {
          const source = result._source;
          // Handle price conversion based on currency
          // USD prices are in cents, so divide by 100
          // Other currencies might already be in base units
          const currencyCode = source.currency.trim().toUpperCase();
          let price = source.price_cents;
          if (currencyCode === 'USD' || currencyCode.includes('USD')) {
            price = source.price_cents / 100;
          } else if (source.price_cents < 100 && currencyCode !== 'USD') {
            // For non-USD currencies with small values, assume already in base units
            price = source.price_cents;
          } else {
            // Default: divide by 100 for most currencies
            price = source.price_cents / 100;
          }

          products.push({
            id: source.id,
            title: source.title,
            brand: source.brand,
            condition: source.condition,
            price: price,
            currency: source.currency.trim(),
            imageUrl: source.image_url,
            sellerUrl: source.seller_url,
            size: source.size || undefined,
            color: source.color || undefined,
            category: source.category || undefined,
            marketplace: source.marketplace_code,
            score: result._score || 0,
          });
        }
      });
    }
  });
  
  return products;
};

/**
 * Search products using the NLP search API
 * @param query - Search query string
 * @returns Promise with array of Product objects
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query || query.trim() === '') {
    throw new Error('Search query cannot be empty');
  }

  try {
    // Encode the query parameter
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${API_BASE_URL}?query=${encodedQuery}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform API response to our Product format
    // API returns an array of arrays (groups of results)
    return transformApiResponseToProducts(data as ApiSearchResponse);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};
