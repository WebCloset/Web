import { AdminIssue, AdminListing, AdminOverview, SourceCode } from '../types/admin'

const ADMIN_TOKEN_KEY = 'webcloset_admin_token'
const ADMIN_EXPIRES_AT_KEY = 'webcloset_admin_expires_at'
const ADMIN_LAST_ACTIVITY_KEY = 'webcloset_admin_last_activity'

const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000

/** Unix seconds from admin token payload or persisted login response. */
export function parseAdminTokenExpiresAt(token: string): number | null {
  try {
    const [payloadEncoded] = token.split('.')
    if (!payloadEncoded) return null
    const pad = (4 - (payloadEncoded.length % 4)) % 4
    const padded = payloadEncoded + '='.repeat(pad)
    const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(binary) as { expires_at?: number }
    return typeof payload.expires_at === 'number' ? payload.expires_at : null
  } catch {
    return null
  }
}

/** Idle timeout in ms; override with `VITE_ADMIN_IDLE_TIMEOUT_MS` (e.g. 900000 for 15 minutes). */
export function getAdminIdleTimeoutMs(): number {
  const raw = import.meta.env.VITE_ADMIN_IDLE_TIMEOUT_MS
  const parsed = typeof raw === 'string' ? parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDLE_TIMEOUT_MS
}

export type AdminSessionCheck =
  | { ok: true }
  | { ok: false; reason: 'no_token' | 'token_expired' | 'idle' }

function readExpiresAtSeconds(token: string | null): number | null {
  if (!token) return null
  const stored = localStorage.getItem(ADMIN_EXPIRES_AT_KEY)
  if (stored) {
    const n = parseInt(stored, 10)
    if (Number.isFinite(n)) return n
  }
  return parseAdminTokenExpiresAt(token)
}

export function checkAdminSession(): AdminSessionCheck {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return { ok: false, reason: 'no_token' }
  const expSec = readExpiresAtSeconds(token)
  const nowSec = Math.floor(Date.now() / 1000)
  if (expSec != null && nowSec >= expSec) {
    return { ok: false, reason: 'token_expired' }
  }
  const idleMs = getAdminIdleTimeoutMs()
  const lastRaw = localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY)
  const last = lastRaw ? parseInt(lastRaw, 10) : NaN
  const lastActivity = Number.isFinite(last) ? last : Date.now()
  if (Date.now() - lastActivity > idleMs) {
    return { ok: false, reason: 'idle' }
  }
  return { ok: true }
}

/** Hydrate auth from storage; clears invalid sessions and returns a user-visible message when applicable. */
export function getInitialAdminAuthState(): {
  authenticated: boolean
  sessionNotice: string | null
} {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return { authenticated: false, sessionNotice: null }

  const check = checkAdminSession()
  if (check.ok) return { authenticated: true, sessionNotice: null }

  adminTokenStorage.clear()
  if (check.reason === 'idle') {
    return {
      authenticated: false,
      sessionNotice: 'You were signed out after a period of inactivity.'
    }
  }
  if (check.reason === 'token_expired') {
    return {
      authenticated: false,
      sessionNotice: 'Your session has expired. Please sign in again.'
    }
  }
  return { authenticated: false, sessionNotice: null }
}

export function isAdminAuthErrorMessage(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('unauthorized') ||
    m.includes('token expired') ||
    m.includes('invalid token') ||
    m.includes('401')
  )
}

const getBaseApiUrl = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  const envApi = import.meta.env.VITE_API_URL
  if (envApi && typeof envApi === 'string') {
    return envApi.replace(/\/$/, '')
  }
  return '/api'
}

const BASE_API_URL = getBaseApiUrl()

const requestJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${BASE_API_URL}${path}`, options)
  if (!response.ok) {
    const text = await response.text()
    let message = text || `Request failed with ${response.status}`
    try {
      const parsed = JSON.parse(text) as { detail?: string | Array<{ msg?: string }> }
      if (typeof parsed.detail === 'string') {
        message = parsed.detail
      } else if (Array.isArray(parsed.detail)) {
        const parts = parsed.detail.map((d) => d.msg).filter(Boolean)
        if (parts.length) message = parts.join(', ')
      }
    } catch {
      /* use raw text */
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export const adminTokenStorage = {
  get() {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  },
  /** Persist token and server expiry; resets idle clock. */
  setSession(token: string, expiresAtUnixSeconds: number) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    localStorage.setItem(ADMIN_EXPIRES_AT_KEY, String(expiresAtUnixSeconds))
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()))
  },
  /** @deprecated Prefer setSession with expires_at from login. Parses expiry from token when possible. */
  set(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
    const parsed = parseAdminTokenExpiresAt(token)
    if (parsed != null) {
      localStorage.setItem(ADMIN_EXPIRES_AT_KEY, String(parsed))
    }
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()))
  },
  touchActivity() {
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()))
  },
  clear() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_EXPIRES_AT_KEY)
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY)
  }
}

export { ADMIN_TOKEN_KEY as ADMIN_TOKEN_STORAGE_KEY }

const getAuthHeaders = () => {
  const token = adminTokenStorage.get()
  if (!token) {
    throw new Error('Not authenticated')
  }
  return { Authorization: `Bearer ${token}` }
}

export const adminLogin = async (username: string, password: string) => {
  return requestJson<{ token: string; username: string; issued_at: number; expires_at: number }>(
    '/admin/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }
  )
}

export const getAdminOverview = async () => {
  return requestJson<AdminOverview>('/admin/overview', {
    headers: getAuthHeaders()
  })
}

export const toggleSourceEnabled = async (sourceCode: SourceCode, enabled: boolean) => {
  return requestJson<{ source: AdminOverview['sources'][number] }>(`/admin/sources/${sourceCode}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ enabled })
  })
}

export const getAdminListings = async (source?: SourceCode) => {
  const query = source ? `?source=${encodeURIComponent(source)}` : ''
  const result = await requestJson<{ listings: AdminListing[] }>(`/admin/listings${query}`, {
    headers: getAuthHeaders()
  })
  return result.listings
}

export const getAdminIssues = async () => {
  const result = await requestJson<{ issues: AdminIssue[] }>('/admin/issues', {
    headers: getAuthHeaders()
  })
  return result.issues
}
