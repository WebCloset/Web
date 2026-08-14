import "./HomeDiscovery.css";
import { DEFAULT_SEARCH_FILTERS, SearchFilters } from "./Hero";

interface DiscoveryChip {
  label: string;
  query: string;
  filters?: Partial<SearchFilters>;
}

interface DiscoverySection {
  id: string;
  title: string;
  chips: DiscoveryChip[];
}

const DISCOVERY_SECTIONS: DiscoverySection[] = [
  {
    id: "style",
    title: "Shop by Style",
    chips: [
      { label: "Y2K", query: "Y2K fashion" },
      { label: "Vintage denim", query: "vintage denim" },
      { label: "Streetwear", query: "streetwear" },
      { label: "Minimalist", query: "minimalist fashion" },
      { label: "Cottagecore", query: "cottagecore dress" },
      { label: "90s americana", query: "90s americana" },
      { label: "Activewear", query: "activewear" },
      { label: "Preppy", query: "preppy style" },
    ],
  },
  {
    id: "price",
    title: "Shop by Price",
    chips: [
      { label: "Under $10", query: "fashion", filters: { priceMax: 10 } },
      { label: "Under $20", query: "fashion", filters: { priceMax: 20 } },
      { label: "Under $50", query: "fashion", filters: { priceMax: 50 } },
      { label: "Under $100", query: "fashion", filters: { priceMax: 100 } },
      { label: "Under $200", query: "designer fashion", filters: { priceMax: 200 } },
    ],
  },
  {
    id: "brands",
    title: "Popular Brands",
    chips: [
      { label: "Nike", query: "Nike" },
      { label: "Adidas", query: "Adidas" },
      { label: "Ralph Lauren", query: "Ralph Lauren" },
      { label: "Gucci", query: "Gucci" },
      { label: "Zara", query: "Zara" },
      { label: "Carhartt", query: "Carhartt" },
      { label: "Levi's", query: "Levis" },
      { label: "North Face", query: "North Face" },
    ],
  },
  {
    id: "marketplace",
    title: "Shop by Marketplace",
    chips: [
      { label: "Depop finds", query: "vintage fashion" },
      { label: "Vinted picks", query: "second hand clothes" },
      { label: "eBay deals", query: "fashion deals" },
      { label: "Amazon basics", query: "fashion", filters: { productType: "retail" } },
      { label: "Grailed grails", query: "designer streetwear" },
      { label: "Reverb gear", query: "music fashion" },
    ],
  },
];

interface HomeDiscoveryProps {
  onChipSearch?: (query: string, filters: SearchFilters) => void;
}

const HomeDiscovery = ({ onChipSearch }: HomeDiscoveryProps) => {
  const handleChipClick = (chip: DiscoveryChip) => {
    const mergedFilters: SearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      ...chip.filters,
    };
    onChipSearch?.(chip.query, mergedFilters);
  };

  return (
    <section className="home-discovery" aria-label="Discover fashion">
      <div className="home-discovery-container">
        {DISCOVERY_SECTIONS.map((section) => (
          <div key={section.id} className="discovery-row">
            <h2 className="discovery-row-title">{section.title}</h2>
            <div className="discovery-row-scroll">
              <div className="discovery-row-chips">
                {section.chips.map((chip) => (
                  <button
                    key={`${section.id}-${chip.label}`}
                    type="button"
                    className="discovery-row-chip"
                    onClick={() => handleChipClick(chip)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeDiscovery;
