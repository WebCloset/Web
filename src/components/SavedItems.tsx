import { Link } from 'react-router-dom'
import './SavedItems.css'
import Header from './Header'
import { useUserAuth } from '../hooks/useUserAuth'
import backgroundImage from '../assets/background.png'

const SavedItems = () => {
  const { user } = useUserAuth()

  return (
    <div
      className="saved-items-page"
      style={{ '--saved-bg-image': `url(${backgroundImage})` } as React.CSSProperties}
    >
      <div className="saved-hero-wrapper">
        <div className="saved-hero-overlay" />
        <div className="saved-hero-content">
          <Header />
          <div className="saved-hero">
            <h1 className="saved-title">Saved Items</h1>
          </div>
        </div>
      </div>
      <main className="saved-main">
        <div className="saved-container">
          {user ? (
            <p className="saved-empty">
              You haven&apos;t saved any items yet. Start searching and save your favourites.
            </p>
          ) : (
            <p className="saved-message">
              Please <Link to="/home">sign in</Link> to view your saved items.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default SavedItems
