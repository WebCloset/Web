import { useState } from 'react'
import './SavedItems.css'
import './SearchResults.css'
import Header from './Header'
import SignInModal from './SignInModal'
import { useUserAuth } from '../hooks/useUserAuth'
import { useSavedItems } from '../hooks/useSavedItems'
import { MdOutlineKeyboardDoubleArrowRight } from 'react-icons/md'
import { HiHeart } from 'react-icons/hi'
import backgroundImage from '../assets/background.png'
import { SavedItem } from '../types/api'

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect width='600' height='600' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-size='36' font-family='Arial, sans-serif'>No Image</text></svg>"

const SavedItems = () => {
  const { user } = useUserAuth()
  const { items, loading, error, removeById, togglingKey } = useSavedItems(user?.email)
  const [selected, setSelected] = useState<SavedItem | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const formatPrice = (priceCents: number | null, currency: string | null) => {
    const cleanCurrency = (currency || 'USD').trim()
    const currencyCode = cleanCurrency.toUpperCase()
    let price = priceCents ?? 0
    if (currencyCode === 'USD' || currencyCode.includes('USD') || price >= 100) {
      price = (priceCents ?? 0) / 100
    }

    try {
      const code =
        cleanCurrency.length >= 3
          ? cleanCurrency.substring(0, 3).toUpperCase()
          : cleanCurrency.toUpperCase()
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code === 'USD' ? 'USD' : code,
      }).format(price)
    } catch {
      return `${cleanCurrency}${price.toLocaleString()}`
    }
  }

  const handleUnsave = async (item: SavedItem, event?: React.MouseEvent) => {
    event?.stopPropagation()
    setRemovingId(item.id)
    try {
      await removeById(item.id)
      if (selected?.id === item.id) setSelected(null)
    } catch {
      /* keep item visible on failure */
    } finally {
      setRemovingId(null)
    }
  }

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
        <div className={`saved-container${user && items.length > 0 ? ' saved-container--wide' : ''}`}>
          {!user ? (
            <p className="saved-message">
              Please{' '}
              <button type="button" className="saved-sign-in-link" onClick={() => setSignInOpen(true)}>
                sign in
              </button>{' '}
              to view your saved items.
            </p>
          ) : loading ? (
            <p className="saved-empty">Loading your saved items...</p>
          ) : error ? (
            <p className="saved-error">{error}</p>
          ) : items.length === 0 ? (
            <p className="saved-empty">
              You haven&apos;t saved any items yet. Start searching and save your favourites.
            </p>
          ) : (
            <div className="saved-products-grid">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="product-card saved-product-card"
                  onClick={() => setSelected(item)}
                >
                  <div className="product-image-container">
                    <img
                      src={item.image_url || FALLBACK_IMAGE}
                      alt={item.title}
                      className="product-image"
                      onError={(e) => {
                        const image = e.currentTarget
                        image.onerror = null
                        image.src = FALLBACK_IMAGE
                      }}
                    />
                    <button
                      type="button"
                      className="product-save-button product-save-button--card is-saved"
                      aria-label="Remove from saved items"
                      disabled={removingId === item.id || togglingKey != null}
                      onClick={(e) => void handleUnsave(item, e)}
                    >
                      <HiHeart size={18} />
                    </button>
                    <div className="product-badge">{item.marketplace_code}</div>
                  </div>
                  <div className="product-hover-overlay">
                    <div className="product-info">
                      <span className="product-name-text">{item.title}</span>
                      <span className="product-price-text">
                        {formatPrice(item.price_cents, item.currency)}
                      </span>
                      {item.condition && (
                        <span className="product-condition-text">Condition: {item.condition}</span>
                      )}
                    </div>
                    <button
                      className="product-hover-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(item)
                      }}
                    >
                      <MdOutlineKeyboardDoubleArrowRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <div className="product-preview-backdrop" onClick={() => setSelected(null)}>
          <div className="product-preview-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="product-preview-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <div className="product-preview-grid">
              <div className="product-preview-image-wrap">
                <img
                  src={selected.image_url || FALLBACK_IMAGE}
                  alt={selected.title}
                  className="product-preview-image"
                  onError={(e) => {
                    const image = e.currentTarget
                    image.onerror = null
                    image.src = FALLBACK_IMAGE
                  }}
                />
              </div>
              <div className="product-preview-details">
                <div className="product-preview-heading">
                  <h3>{selected.title}</h3>
                  <button
                    type="button"
                    className="product-save-button product-save-button--detail is-saved"
                    aria-label="Remove from saved items"
                    disabled={removingId === selected.id}
                    onClick={() => void handleUnsave(selected)}
                  >
                    <HiHeart size={22} />
                  </button>
                </div>
                <p className="product-preview-price">
                  {formatPrice(selected.price_cents, selected.currency)}
                </p>
                <ul>
                  <li><strong>Marketplace:</strong> {selected.marketplace_code}</li>
                  {selected.condition && (
                    <li><strong>Condition:</strong> {selected.condition}</li>
                  )}
                  {selected.brand && <li><strong>Brand:</strong> {selected.brand}</li>}
                  {selected.size && <li><strong>Size:</strong> {selected.size}</li>}
                  {selected.color && <li><strong>Color:</strong> {selected.color}</li>}
                </ul>
                <div className="product-preview-description">
                  <strong>Description / Details</strong>
                  <p>
                    Check the original listing for full seller notes, measurements, and additional item images.
                  </p>
                </div>
                {selected.seller_url && (
                  <a
                    href={selected.seller_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-preview-link"
                  >
                    View Original Listing
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  )
}

export default SavedItems
