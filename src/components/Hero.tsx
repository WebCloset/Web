import { useState } from "react";
import "./Hero.css";
import { HiSearch } from 'react-icons/hi'

interface HeroProps {
  onSearch?: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  const handleLucky = () => {
    // Random popular search queries for "feeling lucky"
    const luckyQueries = [
      "red shoes",
      "nike air jordan",
      "vintage jacket",
      "designer bag",
      "sneakers",
      "dress",
      "hoodie"
    ];
    const randomQuery = luckyQueries[Math.floor(Math.random() * luckyQueries.length)];
    setSearchQuery(randomQuery);
    onSearch?.(randomQuery);
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-subtitle">
          <h1 className="hero-title">
            <span className="hero-title2">STYLE FROM</span>{' '}
            EVERY MARKETPLACE.
            <br />
            IN ONE PLACE.
          </h1>
        </div>

        <div className="search-container">
          <div className="search-box">
            <HiSearch className="search-icon" size={24} />
            <input
              type="text"
              className="search-input"
              placeholder="Search from Depop, eBay, Grailed, Vinted, ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
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
