import { useCallback, useEffect, useRef, useState } from "react";
import "./Hero.css";
import { HiAdjustments, HiMicrophone, HiSearch } from "react-icons/hi";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import ConnectedMarketplacesTicker from "./ConnectedMarketplacesTicker";

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

const RECENT_SEARCHES_KEY = "webcloset_recent_searches";

const ROTATING_PLACEHOLDERS = [
  "black converse",
  "white linen trousers",
  "pink Ralph Lauren shirt",
  "vintage Nike hoodie",
  "designer leather bag",
  "Y2K cargo pants",
  "Carhartt work jacket",
  "white Air Force 1",
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
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const genderOptions = ["Women", "Men", "Unisex", "Kids"];

  useEffect(() => {
    if (searchQuery.trim()) return;

    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((current) => (current + 1) % ROTATING_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 320);
    }, 3200);

    return () => clearInterval(interval);
  }, [searchQuery]);

  const toggleArrayFilter = (key: "sizes" | "genders", value: string) => {
    setPendingFilters((current) => {
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
    setPendingFilters(effectiveFilters);
    saveRecentSearch(trimmed);
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

  const handlePriceChange = (key: "priceMin" | "priceMax", value: string) => {
    const parsed = value === "" ? null : Number(value);
    setPendingFilters((current) => ({
      ...current,
      [key]: parsed != null && !Number.isNaN(parsed) && parsed >= 0 ? parsed : null,
    }));
  };

  const handleOpenFilters = () => {
    setPendingFilters(filters);
    setShowFilters((current) => !current);
  };

  const handleApplyFilters = () => {
    const effectiveFilters = normalizeFilters(pendingFilters);
    setFilters(effectiveFilters);
    setPendingFilters(effectiveFilters);
    setShowFilters(false);

    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim(), effectiveFilters);
    }
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
        setPendingFilters(filters);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFilters, filters]);

  const showRotatingPlaceholder = !searchQuery.trim();

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-headline">
          <p className="hero-eyebrow">One search · Every marketplace</p>
          <h1 className="hero-title">
            <span className="hero-title-line">
              Search{" "}
              <span className="hero-title-accent">second-hand & retail</span>{" "}
              fashion from multiple marketplaces in one place.
            </span>
          </h1>
        </div>

        <div className="search-container">
          <div className="search-box-wrapper" ref={filterContainerRef}>
            <div className="search-box">
              <HiSearch className="search-icon" size={24} />
              <div className="search-input-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder=""
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  aria-label="Search for fashion items"
                />
                {showRotatingPlaceholder && (
                  <span
                    className={`search-placeholder-overlay ${
                      placeholderVisible ? "is-visible" : "is-fading"
                    }`}
                    aria-hidden="true"
                  >
                    Search for &ldquo;{ROTATING_PLACEHOLDERS[placeholderIndex]}&rdquo;
                  </span>
                )}
              </div>
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
                  aria-expanded={showFilters}
                  onClick={handleOpenFilters}
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
                            pendingFilters.sizes.includes(size) ? "is-selected" : ""
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
                            pendingFilters.genders.includes(gender) ? "is-selected" : ""
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
                            pendingFilters.productType === type ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            setPendingFilters((current) => ({
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
                          value={pendingFilters.priceMin ?? ""}
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
                          value={pendingFilters.priceMax ?? ""}
                          onChange={(e) => handlePriceChange("priceMax", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="filters-actions">
                    <button
                      type="button"
                      className="btn-filters-apply"
                      onClick={handleApplyFilters}
                    >
                      Apply
                    </button>
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

          <ConnectedMarketplacesTicker />
        </div>
      </div>
    </section>
  );
};

export default Hero;
