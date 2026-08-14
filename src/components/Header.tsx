import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import logoImage from '../assets/logo.png'
import { HiLockClosed, HiLogout } from 'react-icons/hi'
import SignInModal from './SignInModal'
import { useUserAuth } from '../hooks/useUserAuth'

interface HeaderProps {
  /** When set with `onAdminSignOut`, replaces Sign In with Logout (admin console). */
  adminSessionActive?: boolean
  onAdminSignOut?: () => void
}

const Header = ({ adminSessionActive = false, onAdminSignOut }: HeaderProps) => {
  const location = useLocation()
  const { user, isSignedIn, signOut } = useUserAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showAdminLogout = Boolean(adminSessionActive && onAdminSignOut)

  const handleSignOut = () => {
    signOut()
  }

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
            {showAdminLogout ? (
              <button type="button" className="sign-in-btn sign-in-btn--logout" onClick={onAdminSignOut}>
                <HiLogout size={16} />
                Logout
              </button>
            ) : isSignedIn && user ? (
              <>
                <Link
                  to="/about"
                  className={`nav-link ${location.pathname === '/about' ? 'is-active' : ''}`}
                >
                  About Us
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${location.pathname === '/profile' ? 'is-active' : ''}`}
                >
                  Profile
                </Link>
                <Link
                  to="/saved-items"
                  className={`nav-link ${location.pathname === '/saved-items' ? 'is-active' : ''}`}
                >
                  Saved Items
                </Link>
                <button type="button" className="sign-in-btn sign-in-btn--logout" onClick={handleSignOut}>
                  <HiLogout size={16} />
                  Log Out
                </button>
              </>
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
