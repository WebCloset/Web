import './PartnerLogos.css'
import avenLogo from '../assets/aven.png'
import humaneticsLogo from '../assets/humanetics.png'
import circleLogo from '../assets/circle.png'
import lightaiLogo from '../assets/lightai.png'

const PartnerLogos = () => {
  const partners = [
    { name: 'aven.', logo: avenLogo },
    { name: 'HUMANETICS', logo: humaneticsLogo },
    { name: 'Ccircle', logo: circleLogo },
    { name: 'Light AI', logo: lightaiLogo },
  ]

  return (
    <section className="partner-logos">
      <div className="partner-logos-container">
        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-card">
              <div className="partner-logo">
                <img src={partner.logo} alt={partner.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnerLogos



