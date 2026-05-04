import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import './SignInModal.css'
import { HiX, HiEye, HiEyeOff } from 'react-icons/hi'
import { adminLogin, adminTokenStorage } from '../services/adminApi'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAuthError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setSubmitting(true)
    try {
      const response = await adminLogin(identifier.trim(), password)
      adminTokenStorage.setSession(response.token, response.expires_at)
      setIdentifier('')
      setPassword('')
      onClose()
      navigate('/admin')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setAuthError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <HiX size={24} />
        </button>
        <div className="modal-header">
          <h2 className="modal-title">Sign In</h2>
          <p className="modal-subtitle">Welcome back to WEB CLOSET</p>
        </div>
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signin-identifier" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="signin-identifier"
              name="username"
              className="form-input"
              placeholder="Admin username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
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
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <HiEyeOff size={20} />
                ) : (
                  <HiEye size={20} />
                )}
              </button>
            </div>
          </div>
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox-input" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link">
              Forgot password?
            </a>
          </div>
          {authError && <p className="signin-form-error">{authError}</p>}
          <button type="submit" className="signin-submit-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <a href="#signup" className="signup-link">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default SignInModal
