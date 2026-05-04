import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'
import './NoResultsModal.css'

interface NoResultsModalProps {
  isOpen: boolean
  onClose: () => void
  searchQuery?: string
}

const NoResultsModal = ({ isOpen, onClose, searchQuery }: NoResultsModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="no-results-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="no-results-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-results-modal-title"
      >
        <button type="button" className="no-results-modal-close" onClick={onClose} aria-label="Close">
          <HiX size={22} />
        </button>
        <div className="no-results-modal-body">
          <h2 id="no-results-modal-title" className="no-results-modal-title">
            No results found!
          </h2>
          {searchQuery?.trim() ? (
            <p className="no-results-modal-text">
              We couldn&apos;t find any listings for &quot;{searchQuery.trim()}&quot;. Try different
              keywords, or check that marketplace sources are enabled in admin.
            </p>
          ) : (
            <p className="no-results-modal-text">
              Try a different search, or check that marketplace sources are enabled in admin.
            </p>
          )}
          <button type="button" className="no-results-modal-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default NoResultsModal
