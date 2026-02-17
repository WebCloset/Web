import './About.css'
import Header from './Header'
import backgroundImage from '../assets/background.png'

const About = () => {
  return (
    <div 
      className="about-page"
      style={{
        '--about-bg-image': `url(${backgroundImage})`
      } as React.CSSProperties}
    >
      <div className="about-hero-wrapper">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <Header />
          <div className="about-hero">
            <div className="about-hero-container">
              <h1 className="about-title">
                ABOUT <span className="about-title-accent">US</span>
              </h1>
              <p className="about-subtitle">
                Your one-stop destination for fashion from every marketplace
              </p>
            </div>
          </div>
        </div>
      </div>
      <main className="about-main">
        <section className="about-section">
          <div className="about-container">
            <div className="about-content">
              <h2 className="section-title">
                OUR <span className="section-title-accent">MISSION</span>
              </h2>
              <p className="about-text">
                At WEB CLOSET, we believe that great style shouldn't be limited by platform boundaries. 
                Our mission is to bring together the best fashion finds from Depop, eBay, Grailed, Vinted, 
                and other marketplaces into one seamless shopping experience.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-container">
            <div className="about-content">
              <h2 className="section-title">
                WHAT WE <span className="section-title-accent">DO</span>
              </h2>
              <p className="about-text">
                We aggregate listings from multiple fashion marketplaces, making it easier than ever 
                to discover unique pieces, compare prices, and find exactly what you're looking for. 
                Whether you're searching for vintage finds, designer pieces, or everyday essentials, 
                WEB CLOSET helps you explore it all in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-container">
            <div className="about-content">
              <h2 className="section-title">
                WHY CHOOSE <span className="section-title-accent">US</span>
              </h2>
              <div className="about-features">
                <div className="about-feature">
                  <h3 className="feature-title">Unified Search</h3>
                  <p className="feature-text">
                    Search across multiple marketplaces simultaneously with one simple query.
                  </p>
                </div>
                <div className="about-feature">
                  <h3 className="feature-title">Best Deals</h3>
                  <p className="feature-text">
                    Compare prices across platforms to ensure you get the best value.
                  </p>
                </div>
                <div className="about-feature">
                  <h3 className="feature-title">Curated Selection</h3>
                  <p className="feature-text">
                    Discover handpicked popular items from trusted sellers and platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About
