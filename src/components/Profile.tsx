import { Link } from 'react-router-dom'
import './Profile.css'
import Header from './Header'
import { useUserAuth } from '../hooks/useUserAuth'
import backgroundImage from '../assets/background.png'

const Profile = () => {
  const { user } = useUserAuth()

  return (
    <div
      className="profile-page"
      style={{ '--profile-bg-image': `url(${backgroundImage})` } as React.CSSProperties}
    >
      <div className="profile-hero-wrapper">
        <div className="profile-hero-overlay" />
        <div className="profile-hero-content">
          <Header />
          <div className="profile-hero">
            <h1 className="profile-title">Profile</h1>
          </div>
        </div>
      </div>
      <main className="profile-main">
        <div className="profile-container">
          {user ? (
            <>
              <p className="profile-greeting">Hello, {user.displayName}</p>
              <p className="profile-email">{user.email}</p>
              <Link to="/saved-items" className="profile-link">
                View saved items
              </Link>
            </>
          ) : (
            <p className="profile-message">
              Please <Link to="/home">sign in</Link> to view your profile.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile
