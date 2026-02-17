import { useState } from 'react'
import { createPortal } from 'react-dom'
import './SignInModal.css'
import { HiX, HiEye, HiEyeOff } from 'react-icons/hi'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sign in:', { email, password })
    // Implement sign in logic here
    onClose()
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
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="signin-submit-btn">
            Sign In
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
