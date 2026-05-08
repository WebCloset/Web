import { forwardRef, useMemo, useState } from "react";
import { Product } from "../types/api";
import "./SearchResults.css";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import AdBanner from "./AdBanner";
import { AD_CONFIG } from "../config/ads";
import { SearchFilters } from "./Hero";

const FULL_ROW_INTERVAL = AD_CONFIG.FULL_ROW_AD_INTERVAL ?? 12;
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-size='36' font-family='Arial, sans-serif'>No Image</text></svg>";

interface SearchResultsProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
  filters?: SearchFilters;
}

const SearchResults = forwardRef<HTMLElement, SearchResultsProps>(
  ({ products, isLoading, error, searchQuery, filters }, ref) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product, event?: React.MouseEvent) => {
    // Prevent event bubbling if needed
    if (event) {
      event.stopPropagation();
    }
    setSelectedProduct(product);
  };

  const formatPrice = (price: number, currency: string) => {
    // Clean currency string (remove extra spaces)
    const cleanCurrency = currency.trim();
    
    // Handle common currency symbols
    if (cleanCurrency.includes('₹') || cleanCurrency === 'INR') {
      return `₹${price.toLocaleString('en-IN')}`;
    }
    
    // Try to format with Intl.NumberFormat, fallback to simple format
    try {
      // Extract currency code (first 3 letters if available)
      const currencyCode = cleanCurrency.length >= 3 
        ? cleanCurrency.substring(0, 3).toUpperCase()
        : cleanCurrency.toUpperCase();
      
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode === 'USD' ? 'USD' : currencyCode,
      }).format(price);
    } catch (e) {
      // Fallback: just show currency symbol and price
      return `${cleanCurrency}${price.toLocaleString()}`;
    }
  };

  type GridItem = Product | { type: 'ad'; id: string; index: number; position: 'fullrow' };

  const productsWithAds = useMemo(() => {
    if (!AD_CONFIG.ENABLED) {
      return products;
    }

    const items: GridItem[] = [];
    let fullrowCount = 0;

    products.forEach((product, index) => {
      items.push(product);
      if (index >= products.length - 1) return;

      const n = index + 1;
      const isFullRowSlot = n % FULL_ROW_INTERVAL === 0;

      if (isFullRowSlot) {
        fullrowCount += 1;
        items.push({
          type: 'ad',
          id: `ad-fullrow-${fullrowCount}`,
          index: fullrowCount,
          position: 'fullrow',
        });
      }
    });

    return items;
  }, [products]);

  if (isLoading) {
    return (
      <section ref={ref} className="search-results">
        <div className="search-results-container">
          <h2 className="section-title">
            SEARCHING <span className="section-title-accent">RESULTS</span>
          </h2>
          <div className="loading-message">Loading results...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={ref} className="search-results">
        <div className="search-results-container">
          <h2 className="section-title">
            SEARCH <span className="section-title-accent">RESULTS</span>
          </h2>
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section ref={ref} className="search-results">
        <div className="search-results-container">
          <h2 className="section-title">
            SEARCH <span className="section-title-accent">RESULTS</span>
          </h2>
          {searchQuery && (
            <div className="no-results-message">
              No results found for "{searchQuery}". Try a different search query.
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="search-results">
      <div className="search-results-container">
        <h2 className="section-title">
          SEARCH <span className="section-title-accent">RESULTS</span>
          {searchQuery && (
            <span className="search-query-text"> for "{searchQuery}"</span>
          )}
        </h2>
        {filters && (
          <div className="active-filters">
            {filters.sizes.length > 0 && <span>Sizes: {filters.sizes.join(", ")}</span>}
            {filters.genders.length > 0 && <span>Gender: {filters.genders.join(", ")}</span>}
            {filters.productType !== "all" && (
              <span>Type: {filters.productType === "second-hand" ? "Second-hand" : "Retail"}</span>
            )}
          </div>
        )}
        <div className="products-grid">
          {productsWithAds.map((item, ) => {
            if ('type' in item && item.type === 'ad') {
              return (
                <AdBanner
                  key={item.id}
                  adSlot={`search-results-${item.position}-${item.index}`}
                  adId={item.id}
                  position={item.position}
                  fullRow={item.position === 'fullrow'}
                />
              );
            }
            
            const product = item as Product;
            return (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image-container">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="product-image"
                    onError={(e) => {
                      const image = e.currentTarget;
                      image.onerror = null;
                      image.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="product-badge">{product.marketplace}</div>
                </div>
                <div className="product-hover-overlay">
                  <div className="product-info">
                    <span className="product-name-text">{product.title}</span>
                    <span className="product-price-text">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.brand && (
                      <span className="product-brand-text">Brand: {product.brand}</span>
                    )}
                    {product.condition && (
                      <span className="product-condition-text">Condition: {product.condition}</span>
                    )}
                    {product.size && (
                      <span className="product-size-text">Size: {product.size}</span>
                    )}
                    {product.color && (
                      <span className="product-color-text">Color: {product.color}</span>
                    )}
                  </div>
                  <button 
                    className="product-hover-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product);
                    }}
                  >
                    <MdOutlineKeyboardDoubleArrowRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="results-count">
          Found {products.length} result{products.length !== 1 ? "s" : ""}
        </div>
      </div>
      {selectedProduct && (
        <div
          className="product-preview-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="product-preview-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>
            <div className="product-preview-grid">
              <div className="product-preview-image-wrap">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="product-preview-image"
                  onError={(e) => {
                    const image = e.currentTarget;
                    image.onerror = null;
                    image.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
              <div className="product-preview-details">
                <h3>{selectedProduct.title}</h3>
                <p className="product-preview-price">
                  {formatPrice(selectedProduct.price, selectedProduct.currency)}
                </p>
                <ul>
                  <li><strong>Marketplace:</strong> {selectedProduct.marketplace}</li>
                  {selectedProduct.size && <li><strong>Size:</strong> {selectedProduct.size}</li>}
                  {selectedProduct.condition && (
                    <li><strong>Condition:</strong> {selectedProduct.condition}</li>
                  )}
                  {selectedProduct.brand && <li><strong>Brand:</strong> {selectedProduct.brand}</li>}
                  {selectedProduct.color && <li><strong>Color:</strong> {selectedProduct.color}</li>}
                  {selectedProduct.category && (
                    <li><strong>Category:</strong> {selectedProduct.category}</li>
                  )}
                </ul>
                <div className="product-preview-description">
                  <strong>Description / Details</strong>
                  <p>
                    {selectedProduct.category
                      ? `Category: ${selectedProduct.category}. Check the original listing for full seller notes and additional item images.`
                      : "Check the original listing for full seller notes, measurements, and additional item images."}
                  </p>
                </div>
                {selectedProduct.sellerUrl && (
                  <a
                    href={selectedProduct.sellerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-preview-link"
                  >
                    View Original Listing
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

SearchResults.displayName = "SearchResults";

export default SearchResults;
