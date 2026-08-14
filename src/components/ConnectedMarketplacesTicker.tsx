import "./ConnectedMarketplacesTicker.css";

interface MarketplaceBrand {
  id: string;
  label: string;
  className: string;
}

const MARKETPLACES: MarketplaceBrand[] = [
  { id: "depop", label: "depop", className: "mp-depop" },
  { id: "vinted", label: "Vinted", className: "mp-vinted" },
  { id: "amazon", label: "amazon", className: "mp-amazon" },
  { id: "ebay", label: "eBay", className: "mp-ebay" },
  { id: "reverb", label: "Reverb", className: "mp-reverb" },
  { id: "grailed", label: "Grailed", className: "mp-grailed" },
  { id: "poshmark", label: "Poshmark", className: "mp-poshmark" },
  { id: "etsy", label: "Etsy", className: "mp-etsy" },
  { id: "vestiaire", label: "Vestiaire", className: "mp-vestiaire" },
  { id: "asos", label: "ASOS", className: "mp-asos" },
];

const TickerItem = ({ brand }: { brand: MarketplaceBrand }) => (
  <span className={`ticker-item ${brand.className}`} aria-hidden="true">
    {brand.label}
  </span>
);

const ConnectedMarketplacesTicker = () => {
  const tickerItems = [...MARKETPLACES, ...MARKETPLACES];

  return (
    <div className="marketplace-ticker" aria-label="Connected marketplaces">
      <span className="marketplace-ticker-label">Connected marketplaces</span>
      <div className="marketplace-ticker-track-wrap">
        <div className="marketplace-ticker-track">
          <div className="marketplace-ticker-content">
            {tickerItems.map((brand, index) => (
              <TickerItem key={`${brand.id}-${index}`} brand={brand} />
            ))}
          </div>
          <div className="marketplace-ticker-content" aria-hidden="true">
            {tickerItems.map((brand, index) => (
              <TickerItem key={`${brand.id}-dup-${index}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectedMarketplacesTicker;
