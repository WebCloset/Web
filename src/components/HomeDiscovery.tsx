import { useEffect, useRef, useState } from "react";
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
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeSection =
    DISCOVERY_SECTIONS.find((section) => section.id === activeSectionId) ?? null;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelectHeader = (section: DiscoverySection) => {
    setActiveSectionId(section.id);
    setIsHeaderMenuOpen(false);
  };

  const handleChipClick = (chip: DiscoveryChip) => {
    const mergedFilters: SearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      ...chip.filters,
    };
    onChipSearch?.(chip.query, mergedFilters);
  };

  return (
    <section className="home-discovery" aria-label="Discover fashion">
      <div className="home-discovery-container home-discovery-centered">
        <div className="discovery-selectors" aria-label="Discovery categories">
          <div
            ref={dropdownRef}
            className={`discovery-dropdown${isHeaderMenuOpen ? " is-open" : ""}${
              activeSection ? " has-selection" : ""
            }`}
          >
            <button
              type="button"
              className="discovery-dropdown-trigger"
              aria-expanded={isHeaderMenuOpen}
              aria-controls="discovery-header-menu"
              onClick={() => setIsHeaderMenuOpen((open) => !open)}
            >
              <span className="discovery-dropdown-title">
                {activeSection ? activeSection.title : "Browse by"}
              </span>
              <span className="discovery-dropdown-chevron" aria-hidden="true" />
            </button>

            {isHeaderMenuOpen && (
              <ul
                id="discovery-header-menu"
                className="discovery-dropdown-menu"
                role="listbox"
                aria-label="Discovery categories"
              >
                {DISCOVERY_SECTIONS.map((section) => {
                  const isActive = section.id === activeSectionId;
                  return (
                    <li key={section.id} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        className={`discovery-dropdown-option${isActive ? " is-active" : ""}`}
                        onClick={() => handleSelectHeader(section)}
                      >
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="discovery-options-panel">
          {!activeSection && (
            <div className="discovery-options-empty">
              <h2 className="discovery-options-heading">Choose a category</h2>
              <p className="discovery-options-copy">
                Select a header from the dropdown to see its options.
              </p>
            </div>
          )}

          {activeSection && (
            <div className="discovery-row">
              <h2 className="discovery-row-title">{activeSection.title}</h2>
              <div className="discovery-row-scroll">
                <div className="discovery-row-chips">
                  {activeSection.chips.map((chip) => (
                    <button
                      key={`${activeSection.id}-${chip.label}`}
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
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeDiscovery;
