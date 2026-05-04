import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import logoImage from '../assets/logo.png'
import { HiLockClosed, HiLogout } from 'react-icons/hi'
import SignInModal from './SignInModal'

interface HeaderProps {
  /** When set with `onAdminSignOut`, replaces Sign In with Logout (admin console). */
  adminSessionActive?: boolean
  onAdminSignOut?: () => void
}

const Header = ({ adminSessionActive = false, onAdminSignOut }: HeaderProps) => {
  const location = useLocation()
  const isAboutPage = location.pathname === '/webcloset/about' || location.pathname === '/about'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showAdminLogout = Boolean(adminSessionActive && onAdminSignOut)

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/home" className="logo">
            <img 
              src={logoImage} 
              alt="Web Closet Logo" 
              className="logo-image"
            />
            <span className="logo-text">WEB CLOSET</span>
          </Link>
          <nav className="header-nav">
            {isAboutPage ? (
              <Link to="/home" className="nav-link">Home</Link>
            ) : (
              <Link to="/about" className="nav-link">About Us</Link>
            )}
            {showAdminLogout ? (
              <button type="button" className="sign-in-btn sign-in-btn--logout" onClick={onAdminSignOut}>
                <HiLogout size={16} />
                Logout
              </button>
            ) : (
              <button type="button" className="sign-in-btn" onClick={() => setIsModalOpen(true)}>
                <HiLockClosed size={16} />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>
      {!showAdminLogout && (
        <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}

export default Header

