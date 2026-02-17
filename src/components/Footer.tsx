import './Footer.css'
import { HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi'
import footerImage from '../assets/footer.jpg'

const Footer = () => {
  return (
    <footer 
      className="footer"
      style={{
        '--footer-bg-image': `url(${footerImage})`
      } as React.CSSProperties}
    >
      <div className="footer-container">
        <div className="footer-section footer-contact">
          <div className="contact-item">
            <HiLocationMarker size={20} />
            <span>123 Bloom Avenue, Los Angeles</span>
          </div>
          <div className="contact-item">
            <HiMail size={20} />
            <span>Webcloset@gmail.com</span>
          </div>
          <div className="contact-item">
            <HiPhone size={20} />
            <span>+1 888 888 (8888)</span>
          </div>
        </div>
        <div className="footer-section footer-legal">
          <a href="#privacy" className="legal-link">
            Privacy Policy
          </a>
          <span className="legal-separator">|</span>
          <a href="#terms" className="legal-link">
            Terms & Conditions
          </a>
        </div>
      
      </div>
    </footer>
  )
}

export default Footer



