import { useRef, useState } from "react";
import "./HomeDiscovery.css";
import { DEFAULT_SEARCH_FILTERS, SearchFilters } from "./Hero";

interface DiscoveryLink {
  label: string;
  query: string;
  filters?: Partial<SearchFilters>;
  imageUrl: string;
}

interface BrandCard {
  name: string;
  query: string;
  images: [string, string, string, string];
}

interface WeeklyItem {
  label: string;
  query: string;
  imageUrl: string;
  searches: string;
}

interface PriceCard {
  label: string;
  amount: string;
  query: string;
  filters: Partial<SearchFilters>;
}

const STYLE_ITEMS: DiscoveryLink[] = [
  {
    label: "Y2K bags",
    query: "Y2K bag",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
  },
  {
    label: "Waxed jackets",
    query: "waxed jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop",
  },
  {
    label: "On point",
    query: "fashion boots",
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=400&fit=crop",
  },
  {
    label: "Funnel-neck jackets",
    query: "funnel neck jacket",
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop",
  },
  {
    label: "Velour tracksuit trend",
    query: "velour tracksuit",
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop",
  },
  {
    label: "Camo caps",
    query: "camo cap",
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=400&fit=crop",
  },
];

const BRAND_CARDS: BrandCard[] = [
  {
    name: "Nike",
    query: "Nike",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300&h=300&fit=crop",
    ],
  },
  {
    name: "Ralph Lauren",
    query: "Ralph Lauren",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop",
    ],
  },
  {
    name: "North Face",
    query: "North Face",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd62856?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=300&h=300&fit=crop",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop",
    ],
  },
];

const WEEKLY_ITEMS: WeeklyItem[] = [
  {
    label: "Sorel boots",
    query: "Sorel boots",
    searches: "+1.4k searches",
    imageUrl:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&h=500&fit=crop",
  },
  {
    label: "Desigual",
    query: "Desigual",
    searches: "+900 searches",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=500&fit=crop",
  },
  {
    label: "Whimsygoth",
    query: "whimsygoth fashion",
    searches: "+2.1k searches",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=500&fit=crop",
  },
  {
    label: "Kate Spade purse",
    query: "Kate Spade purse",
    searches: "+1.1k searches",
    imageUrl:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500&h=500&fit=crop",
  },
  {
    label: "Vintage denim",
    query: "vintage denim",
    searches: "+1.8k searches",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
  },
  {
    label: "Streetwear",
    query: "streetwear",
    searches: "+3.2k searches",
    imageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=500&h=500&fit=crop",
  },
];

const PRICE_CARDS: PriceCard[] = [
  { label: "Under", amount: "$10", query: "fashion", filters: { priceMax: 10 } },
  { label: "Under", amount: "$20", query: "fashion", filters: { priceMax: 20 } },
  { label: "Under", amount: "$50", query: "fashion", filters: { priceMax: 50 } },
  { label: "Under", amount: "$100", query: "fashion", filters: { priceMax: 100 } },
];

interface HomeDiscoveryProps {
  onChipSearch?: (query: string, filters: SearchFilters) => void;
}

const HomeDiscovery = ({ onChipSearch }: HomeDiscoveryProps) => {
  const weeklyTrackRef = useRef<HTMLDivElement | null>(null);
  const [weeklyIndex, setWeeklyIndex] = useState(0);

  const runSearch = (query: string, partialFilters?: Partial<SearchFilters>) => {
    const filters: SearchFilters = {
      ...DEFAULT_SEARCH_FILTERS,
      ...partialFilters,
    };
    onChipSearch?.(query, filters);
  };

  const scrollWeekly = (direction: "prev" | "next") => {
    const track = weeklyTrackRef.current;
    if (!track) return;
    const card = track.querySelector(".discovery-weekly-card") as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 240;
    const nextIndex =
      direction === "next"
        ? Math.min(weeklyIndex + 1, WEEKLY_ITEMS.length - 1)
        : Math.max(weeklyIndex - 1, 0);
    setWeeklyIndex(nextIndex);
    track.scrollTo({ left: nextIndex * step, behavior: "smooth" });
  };

  return (
    <section className="home-discovery" aria-label="Discover fashion">
      <div className="home-discovery-container">
        <div className="discovery-section">
          <h2 className="discovery-section-title">Shop by style</h2>
          <div className="discovery-style-grid">
            {STYLE_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="discovery-style-card"
                onClick={() => runSearch(item.query)}
              >
                <div className="discovery-style-image-wrap">
                  <img src={item.imageUrl} alt={item.label} className="discovery-style-image" />
                </div>
                <span className="discovery-style-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="discovery-section">
          <h2 className="discovery-section-title">Popular brands</h2>
          <div className="discovery-brands-row">
            {BRAND_CARDS.map((brand) => (
              <button
                key={brand.name}
                type="button"
                className="discovery-brand-card"
                onClick={() => runSearch(brand.query)}
              >
                <div className="discovery-brand-mosaic" aria-hidden="true">
                  {brand.images.map((src, index) => (
                    <img key={`${brand.name}-${index}`} src={src} alt="" />
                  ))}
                </div>
                <span className="discovery-brand-name">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="discovery-section">
          <div className="discovery-section-header">
            <h2 className="discovery-section-title">Popular this week</h2>
            <div className="discovery-carousel-controls">
              <button
                type="button"
                className="discovery-carousel-btn"
                aria-label="Previous popular items"
                onClick={() => scrollWeekly("prev")}
                disabled={weeklyIndex === 0}
              >
                ‹
              </button>
              <button
                type="button"
                className="discovery-carousel-btn"
                aria-label="Next popular items"
                onClick={() => scrollWeekly("next")}
                disabled={weeklyIndex >= WEEKLY_ITEMS.length - 1}
              >
                ›
              </button>
            </div>
          </div>
          <div className="discovery-weekly-track" ref={weeklyTrackRef}>
            {WEEKLY_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                className="discovery-weekly-card"
                onClick={() => runSearch(item.query)}
              >
                <img src={item.imageUrl} alt={item.label} className="discovery-weekly-image" />
                <span className="discovery-weekly-label">{item.label}</span>
                <span className="discovery-weekly-meta">{item.searches}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="discovery-section">
          <h2 className="discovery-section-title">Shop by price</h2>
          <div className="discovery-price-row">
            {PRICE_CARDS.map((card) => (
              <button
                key={card.amount}
                type="button"
                className="discovery-price-card"
                onClick={() => runSearch(card.query, card.filters)}
              >
                <span className="discovery-price-label">{card.label}</span>{" "}
                <span className="discovery-price-amount">{card.amount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeDiscovery;
