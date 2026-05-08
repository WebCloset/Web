import { useEffect, useRef, useState } from "react";
import "./Hero.css";
import { HiAdjustments, HiSearch } from "react-icons/hi";

export interface SearchFilters {
  sizes: string[];
  genders: string[];
  productType: "all" | "second-hand" | "retail";
}

interface HeroProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    sizes: [],
    genders: [],
    productType: "all",
  });

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const genderOptions = ["Women", "Men", "Unisex", "Kids"];

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim(), filters);
    }
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
    setSearchQuery(randomQuery);
    onSearch?.(randomQuery, filters);
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

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-subtitle">
          <h1 className="hero-title">
            <span className="hero-title2">STYLE FROM</span>{" "}
            EVERY MARKETPLACE.
            <br />
            IN ONE PLACE.
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
              <button
                type="button"
                className="filter-button filter-button--icon"
                aria-label="Open filters"
                onClick={() => setShowFilters((current) => !current)}
              >
                <HiAdjustments size={18} />
              </button>

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
                </div>
              )}
            </div>
          </div>

          <div className="hero-buttons">
            <button className="btn-search" onClick={handleSearch}>
              Search
            </button>
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
