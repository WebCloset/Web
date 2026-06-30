import { useCallback, useEffect, useRef, useState } from "react";
import "./Hero.css";
import { HiAdjustments, HiChevronDown, HiMicrophone, HiSearch } from "react-icons/hi";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export interface SearchFilters {
  sizes: string[];
  genders: string[];
  productType: "all" | "second-hand" | "retail";
  priceMin: number | null;
  priceMax: number | null;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  sizes: [],
  genders: [],
  productType: "all",
  priceMin: null,
  priceMax: null,
};

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

const RECENT_SEARCHES_KEY = "webcloset_recent_searches";

const DISCOVERY_SECTIONS: DiscoverySection[] = [
  {
    id: "trending",
    title: "Trending searches",
    chips: [
      { label: "Nike Dunk", query: "Nike Dunk" },
      { label: "Vintage denim", query: "vintage denim" },
      { label: "Designer bags", query: "designer bag" },
      { label: "Y2K tops", query: "Y2K top" },
      { label: "Air Jordan", query: "Air Jordan" },
    ],
  },
  {
    id: "under50",
    title: "Best under $50",
    chips: [
      { label: "Sneakers", query: "sneakers", filters: { priceMax: 50 } },
      { label: "Vintage tees", query: "vintage tee", filters: { priceMax: 50 } },
      { label: "Accessories", query: "accessories", filters: { priceMax: 50 } },
      { label: "Second-hand hoodies", query: "hoodie", filters: { priceMax: 50, productType: "second-hand" } },
    ],
  },
  {
    id: "designer",
    title: "Designer deals",
    chips: [
      { label: "Gucci", query: "Gucci" },
      { label: "Prada", query: "Prada" },
      { label: "Louis Vuitton", query: "Louis Vuitton" },
      { label: "Balenciaga", query: "Balenciaga" },
    ],
  },
  {
    id: "vintage",
    title: "Vintage picks",
    chips: [
      { label: "Vintage jacket", query: "vintage jacket" },
      { label: "90s denim", query: "90s denim" },
      { label: "Retro sneakers", query: "retro sneakers" },
      { label: "Vintage band tee", query: "vintage band tee" },
    ],
  },
];

const getRecentSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return;
  const updated = [trimmed, ...getRecentSearches().filter((item) => item !== trimmed)].slice(0, 6);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
};

const normalizeFilters = (filters: SearchFilters): SearchFilters => {
  const { priceMin, priceMax, ...rest } = filters;
  if (priceMin != null && priceMax != null && priceMin > priceMax) {
    return { ...rest, priceMin: priceMax, priceMax: priceMin };
  }
  return filters;
};

interface HeroProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [activeDiscoveryId, setActiveDiscoveryId] = useState("trending");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const genderOptions = ["Women", "Men", "Unisex", "Kids"];

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const toggleArrayFilter = (key: "sizes" | "genders", value: string) => {
    setFilters((current) => {
      const exists = current[key].includes(value);
      const nextValues = exists
        ? current[key].filter((item) => item !== value)
        : [...current[key], value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const runSearch = (query: string, searchFilters: SearchFilters) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const effectiveFilters = normalizeFilters(searchFilters);
    setSearchQuery(trimmed);
    setFilters(effectiveFilters);
    saveRecentSearch(trimmed);
    setRecentSearches(getRecentSearches());
    onSearch?.(trimmed, effectiveFilters);
  };

  const handleSearch = () => {
    runSearch(searchQuery, filters);
  };

  const handleVoiceResult = useCallback(
    (transcript: string) => {
      runSearch(transcript, filters);
    },
    [filters]
  );

  const {
    isListening,
    isSupported: isVoiceSupported,
    error: voiceError,
    startListening,
  } = useSpeechRecognition(handleVoiceResult);

  const handleChipSearch = (query: string, chipFilters?: Partial<SearchFilters>) => {
    const mergedFilters: SearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      ...filters,
      ...chipFilters,
    };
    runSearch(query, mergedFilters);
  };

  const handleLucky = () => {
    const luckyQueries = [
      "red shoes",
      "nike air jordan",
      "vintage jacket",
      "designer bag",
      "sneakers",
      "dress",
      "hoodie",
    ];
    const randomQuery =
      luckyQueries[Math.floor(Math.random() * luckyQueries.length)];
    runSearch(randomQuery, filters);
  };

  const handlePriceChange = (key: "priceMin" | "priceMax", value: string) => {
    const parsed = value === "" ? null : Number(value);
    setFilters((current) => ({
      ...current,
      [key]: parsed != null && !Number.isNaN(parsed) && parsed >= 0 ? parsed : null,
    }));
  };

  useEffect(() => {
    if (!showFilters) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(targetNode)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFilters]);

  const recentSection: DiscoverySection | null =
    recentSearches.length > 0
      ? {
          id: "recent",
          title: "Recently found",
          chips: recentSearches.map((query) => ({ label: query, query })),
        }
      : {
          id: "recent",
          title: "Recently found",
          chips: [
            { label: "Leather bag", query: "leather bag" },
            { label: "White sneakers", query: "white sneakers" },
            { label: "Midi skirt", query: "midi skirt" },
          ],
        };

  const discoverySections = [DISCOVERY_SECTIONS[0], recentSection, ...DISCOVERY_SECTIONS.slice(1)];
  const activeDiscoverySection =
    discoverySections.find((section) => section.id === activeDiscoveryId) ?? discoverySections[0];

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-headline">
          <p className="hero-eyebrow">One search · Every marketplace</p>
          <h1 className="hero-title">
            <span className="hero-title-line">
              Search{" "}
              <span className="hero-title-accent">second-hand & retail</span> fashion
            </span>
            <span className="hero-title-line hero-title-line--secondary">
              from multiple marketplaces{" "}
              <span className="hero-title-emphasis">in one place.</span>
            </span>
          </h1>
        </div>

        <div className="search-container">
          <div className="search-box-wrapper" ref={filterContainerRef}>
            <div className="search-box">
              <HiSearch className="search-icon" size={24} />
              <input
                type="text"
                className="search-input"
                placeholder="Search from Depop, eBay, Grailed, Vinted, ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="search-box-actions">
                {isVoiceSupported && (
                  <button
                    type="button"
                    className={`filter-button filter-button--icon mic-button ${
                      isListening ? "is-listening" : ""
                    }`}
                    aria-label={isListening ? "Stop voice search" : "Search by voice"}
                    aria-pressed={isListening}
                    onClick={startListening}
                  >
                    <HiMicrophone size={18} />
                  </button>
                )}
                <button
                  type="button"
                  className="filter-button filter-button--icon"
                  aria-label="Open filters"
                  onClick={() => setShowFilters((current) => !current)}
                >
                  <HiAdjustments size={18} />
                </button>
                <button
                  type="button"
                  className="btn-search btn-search--inline"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              {showFilters && (
                <div className="filters-panel filters-dropdown">
                  <div className="filters-group">
                    <span className="filters-title">Sizes</span>
                    <div className="filter-tags">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`filter-tag ${
                            filters.sizes.includes(size) ? "is-selected" : ""
                          }`}
                          onClick={() => toggleArrayFilter("sizes", size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filters-group">
                    <span className="filters-title">Gender</span>
                    <div className="filter-tags">
                      {genderOptions.map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          className={`filter-tag ${
                            filters.genders.includes(gender) ? "is-selected" : ""
                          }`}
                          onClick={() => toggleArrayFilter("genders", gender)}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filters-group">
                    <span className="filters-title">Listing Type</span>
                    <div className="filter-tags">
                      {(["all", "second-hand", "retail"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`filter-tag ${
                            filters.productType === type ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            setFilters((current) => ({
                              ...current,
                              productType: type,
                            }))
                          }
                        >
                          {type === "all"
                            ? "All"
                            : type === "second-hand"
                            ? "Second-hand"
                            : "Retail"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filters-group">
                    <span className="filters-title">Price</span>
                    <div className="price-range-inputs">
                      <div className="price-input-wrapper">
                        <label className="price-input-label" htmlFor="price-min">
                          Min ($)
                        </label>
                        <input
                          id="price-min"
                          type="number"
                          className="price-input"
                          min="0"
                          step="1"
                          placeholder="Min"
                          value={filters.priceMin ?? ""}
                          onChange={(e) => handlePriceChange("priceMin", e.target.value)}
                        />
                      </div>
                      <span className="price-range-separator">–</span>
                      <div className="price-input-wrapper">
                        <label className="price-input-label" htmlFor="price-max">
                          Max ($)
                        </label>
                        <input
                          id="price-max"
                          type="number"
                          className="price-input"
                          min="0"
                          step="1"
                          placeholder="Max"
                          value={filters.priceMax ?? ""}
                          onChange={(e) => handlePriceChange("priceMax", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {voiceError && (
              <p className="voice-search-message" role="alert">
                {voiceError}
              </p>
            )}
            {isListening && (
              <p className="voice-search-message voice-search-message--listening" aria-live="polite">
                Listening… speak your search
              </p>
            )}
          </div>

          <div className="discovery-panel">
            <button
              type="button"
              className={`discovery-toggle ${discoveryOpen ? "is-open" : ""}`}
              onClick={() => setDiscoveryOpen((open) => !open)}
              aria-expanded={discoveryOpen}
            >
              Browse suggestions
              <HiChevronDown className="discovery-toggle-icon" size={16} aria-hidden />
            </button>

            {discoveryOpen && (
              <div className="discovery-sections">
                <div className="discovery-tabs" role="tablist" aria-label="Suggestion categories">
                  {discoverySections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={activeDiscoveryId === section.id}
                      className={`discovery-tab ${
                        activeDiscoveryId === section.id ? "is-active" : ""
                      }`}
                      onClick={() => setActiveDiscoveryId(section.id)}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
                <div
                  className="discovery-chips"
                  role="tabpanel"
                  aria-label={activeDiscoverySection.title}
                >
                  {activeDiscoverySection.chips.map((chip) => (
                    <button
                      key={`${activeDiscoverySection.id}-${chip.label}`}
                      type="button"
                      className="discovery-chip"
                      onClick={() => handleChipSearch(chip.query, chip.filters)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hero-buttons">
            <button className="btn-lucky" onClick={handleLucky}>
              I'm feeling lucky
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
