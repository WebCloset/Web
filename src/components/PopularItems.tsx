import { useState } from "react";
import { colors } from "../styles/theme";
import "./PopularItems.css";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  bgColor: string;
}

const PopularItems = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const products: Product[] = [
    {
      id: 1,
      name: "Leather shoulder bag",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      bgColor: colors.productPurple,
    },
    {
      id: 2,
      name: "Classic court sneaker",
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      bgColor: colors.productGreen,
    },
    {
      id: 3,
      name: "Women's midi skirt",
      imageUrl:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      bgColor: colors.productGray,
    },
    {
      id: 4,
      name: "Soft orange cap",
      imageUrl:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
      bgColor: colors.productGray,
    },
  ];

  const handleProductClick = (productName: string) => {
    console.log("Clicked product:", productName);
    // Implement product navigation
  };

  return (
    <section className="popular-items">
      <div className="popular-items-container">
        <h2 className="section-title">
          POPULAR <span className="section-title-accent">ITEMS</span>
        </h2>
        <div className="products-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleProductClick(product.name)}
            >
              <div
                className="product-image-container"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-hover-overlay">
                <span className="product-name-text">{product.name}</span>
                <button className="product-hover-button">
                  <MdOutlineKeyboardDoubleArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-dots">
          {[0, 1].map((index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularItems;
