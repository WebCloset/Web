const USER_SESSION_KEY = 'webcloset_user_session'

/** Demo account for testing the signed-in experience before launch. */
export const DEMO_USER = {
  email: 'demo@webcloset.com',
  password: 'demo123',
  displayName: 'Demo User',
} as const

export interface UserSession {
  email: string
  displayName: string
}

const parseSession = (raw: string | null): UserSession | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as UserSession
    if (typeof parsed.email === 'string' && typeof parsed.displayName === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export const userAuthStorage = {
  getSession(): UserSession | null {
    return parseSession(localStorage.getItem(USER_SESSION_KEY))
  },

  setSession(session: UserSession) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))
    window.dispatchEvent(new Event('user-auth-change'))
  },

  clearSession() {
    localStorage.removeItem(USER_SESSION_KEY)
    window.dispatchEvent(new Event('user-auth-change'))
  },
}

export const userLogin = (email: string, password: string): UserSession => {
  const normalizedEmail = email.trim().toLowerCase()

  if (
    normalizedEmail === DEMO_USER.email &&
    password === DEMO_USER.password
  ) {
    return { email: DEMO_USER.email, displayName: DEMO_USER.displayName }
  }

  const stored = localStorage.getItem(`webcloset_user_${normalizedEmail}`)
  if (stored) {
    try {
      const account = JSON.parse(stored) as { email: string; password: string; displayName: string }
      if (account.password === password) {
        return { email: account.email, displayName: account.displayName }
      }
    } catch {
      // fall through
    }
  }

  throw new Error('Invalid email or password')
}

export const userRegister = (
  email: string,
  password: string,
  displayName: string
): UserSession => {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password || password.length < 6) {
    throw new Error('Please enter a valid email and a password with at least 6 characters')
  }

  if (normalizedEmail === DEMO_USER.email) {
    throw new Error('This email is reserved. Use the demo account or choose another email.')
  }

  const key = `webcloset_user_${normalizedEmail}`
  if (localStorage.getItem(key)) {
    throw new Error('An account with this email already exists')
  }

  const session: UserSession = {
    email: normalizedEmail,
    displayName: displayName.trim() || normalizedEmail.split('@')[0],
  }

  localStorage.setItem(
    key,
    JSON.stringify({ ...session, password })
  )

  return session
}
