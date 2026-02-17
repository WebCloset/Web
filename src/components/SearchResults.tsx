import { forwardRef, useMemo } from "react";
import { Product } from "../types/api";
import "./SearchResults.css";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import AdBanner from "./AdBanner";
import { AD_CONFIG } from "../config/ads";

const FULL_ROW_INTERVAL = AD_CONFIG.FULL_ROW_AD_INTERVAL ?? 12;

interface SearchResultsProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
}

const SearchResults = forwardRef<HTMLElement, SearchResultsProps>(
  ({ products, isLoading, error, searchQuery }, ref) => {
  const handleProductClick = (product: Product, event?: React.MouseEvent) => {
    // Prevent event bubbling if needed
    if (event) {
      event.stopPropagation();
    }
    // Open seller URL in new tab
    if (product.sellerUrl) {
      window.open(product.sellerUrl, "_blank", "noopener,noreferrer");
    }
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

  // Insert ads between products: inline (between) and full-row (lower frequency)
  type GridItem = Product | { type: 'ad'; id: string; index: number; position: 'between' | 'fullrow' };

  const productsWithAds = useMemo(() => {
    if (!AD_CONFIG.ENABLED) {
      return products;
    }

    const items: GridItem[] = [];
    let betweenCount = 0;
    let fullrowCount = 0;

    products.forEach((product, index) => {
      items.push(product);
      if (index >= products.length - 1) return;

      const n = index + 1;
      const isFullRowSlot = n % FULL_ROW_INTERVAL === 0;
      const isBetweenSlot = n % AD_CONFIG.AD_INTERVAL === 0;

      if (isFullRowSlot) {
        fullrowCount += 1;
        items.push({
          type: 'ad',
          id: `ad-fullrow-${fullrowCount}`,
          index: fullrowCount,
          position: 'fullrow',
        });
      } else if (isBetweenSlot) {
        betweenCount += 1;
        items.push({
          type: 'ad',
          id: `ad-between-${betweenCount}`,
          index: betweenCount,
          position: 'between',
        });
      }
    });

    return items;
  }, [products]);

  return (
    <section ref={ref} className="search-results">
      <div className="search-results-container">
        <h2 className="section-title">
          SEARCH <span className="section-title-accent">RESULTS</span>
          {searchQuery && (
            <span className="search-query-text"> for "{searchQuery}"</span>
          )}
        </h2>
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
                      // Fallback image if image fails to load
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x400?text=No+Image";
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
    </section>
  );
});

SearchResults.displayName = "SearchResults";

export default SearchResults;
