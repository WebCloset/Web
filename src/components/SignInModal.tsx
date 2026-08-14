import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './SignInModal.css'
import { HiX, HiEye, HiEyeOff } from 'react-icons/hi'
import { DEMO_USER, userAuthStorage, userLogin, userRegister } from '../services/userAuth'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalMode = 'signin' | 'create'

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const [mode, setMode] = useState<ModalMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAuthError(null)
      setMode('signin')
    }
  }, [isOpen])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setAuthError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setSubmitting(true)

    try {
      const session =
        mode === 'signin'
          ? userLogin(email, password)
          : userRegister(email, password, displayName)

      userAuthStorage.setSession(session)
      resetForm()
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setAuthError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchToCreate = (e: React.MouseEvent) => {
    e.preventDefault()
    setMode('create')
    setAuthError(null)
  }

  const switchToSignIn = (e: React.MouseEvent) => {
    e.preventDefault()
    setMode('signin')
    setAuthError(null)
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
          <HiX size={24} />
        </button>
        <div className="modal-header">
          <h2 className="modal-title">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
          <p className="modal-subtitle">
            {mode === 'signin'
              ? 'Welcome back to WEB CLOSET'
              : 'Join WEB CLOSET to save items and personalise your experience'}
          </p>
        </div>
        <form className="signin-form" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="form-group">
              <label htmlFor="signin-display-name" className="form-label">
                Display name
              </label>
              <input
                type="text"
                id="signin-display-name"
                className="form-input"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="signin-email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="signin-email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input password-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'create' ? 6 : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>
          {mode === 'signin' && (
            <p className="signin-demo-hint">
              Demo account: {DEMO_USER.email} / {DEMO_USER.password}
            </p>
          )}
          {authError && <p className="signin-form-error">{authError}</p>}
          <button type="submit" className="signin-submit-btn" disabled={submitting}>
            {submitting
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
        <p className="signin-footer-text">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="signin-footer-link" onClick={switchToCreate}>
                Create one here.
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="signin-footer-link" onClick={switchToSignIn}>
                Sign in here.
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default SignInModal
