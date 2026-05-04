import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ADMIN_TOKEN_STORAGE_KEY,
  adminLogin,
  adminTokenStorage,
  checkAdminSession,
  getAdminIssues,
  getAdminListings,
  getAdminOverview,
  getInitialAdminAuthState,
  isAdminAuthErrorMessage,
  toggleSourceEnabled
} from '../services/adminApi'
import { AdminIssue, AdminListing, AdminOverview, SourceCode } from '../types/admin'
import Header from './Header'
import backgroundImage from '../assets/background.png'
import './AdminPage.css'

const SOURCES: SourceCode[] = ['amazon', 'ebay', 'reverb']

const formatPrice = (priceCents: number | null, currency: string) => {
  if (priceCents === null || priceCents <= 0) {
    return 'N/A'
  }
  return `${currency || 'USD'} ${(priceCents / 100).toFixed(2)}`
}

function conditionPillClass(condition: string | null): string {
  if (!condition || condition === '-' || condition === '—') {
    return 'admin-condition admin-condition--muted'
  }
  const c = condition.toLowerCase()
  if (c.includes('brand new') || c === 'new') return 'admin-condition admin-condition--new'
  if (c.includes('excellent')) return 'admin-condition admin-condition--excellent'
  if (c.includes('very good')) return 'admin-condition admin-condition--very-good'
  if (c.includes('good')) return 'admin-condition admin-condition--good'
  if (c.includes('fair')) return 'admin-condition admin-condition--fair'
  if (c.includes('poor')) return 'admin-condition admin-condition--poor'
  return 'admin-condition'
}

function AdminShell({
  children,
  heroSubtitle,
  adminAuthenticated,
  onAdminSignOut
}: {
  children: ReactNode
  heroSubtitle: string
  adminAuthenticated?: boolean
  onAdminSignOut?: () => void
}) {
  return (
    <div
      className="admin-shell"
      style={{ '--admin-bg-image': `url(${backgroundImage})` } as CSSProperties}
    >
      <div className="admin-hero-wrapper">
        <div className="admin-hero-content">
          <Header adminSessionActive={adminAuthenticated} onAdminSignOut={onAdminSignOut} />
          <div className="admin-hero">
            <div className="admin-hero-container">
              <h1 className="admin-hero-title">
                ADMIN <span className="admin-title-accent">CONSOLE</span>
              </h1>
              <p className="admin-hero-subtitle">{heroSubtitle}</p>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function AdminPage() {
  const navigate = useNavigate()
  const initialAuth = useMemo(() => getInitialAdminAuthState(), [])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [sessionNotice, setSessionNotice] = useState<string | null>(initialAuth.sessionNotice)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.authenticated)

  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [listings, setListings] = useState<AdminListing[]>([])
  const [issues, setIssues] = useState<AdminIssue[]>([])
  const [selectedSource, setSelectedSource] = useState<SourceCode | 'all'>('all')
  const [dataError, setDataError] = useState<string | null>(null)
  const isAuthedRef = useRef(isAuthenticated)
  isAuthedRef.current = isAuthenticated

  const endSession = useCallback(
    (reason: 'logout' | 'token_expired' | 'idle' | 'other_tab' | 'api') => {
      adminTokenStorage.clear()
      setIsAuthenticated(false)
      setOverview(null)
      setListings([])
      setIssues([])
      setDataError(null)

      if (reason === 'logout') {
        setSessionNotice(null)
        navigate('/home', { replace: true })
        return
      }

      if (reason === 'idle') {
        setSessionNotice('You were signed out after a period of inactivity.')
      } else if (reason === 'token_expired') {
        setSessionNotice('Your session has expired. Please sign in again.')
      } else if (reason === 'other_tab') {
        setSessionNotice('You were signed out because the session was cleared in another tab.')
      } else {
        setSessionNotice('Your session is no longer valid. Please sign in again.')
      }
    },
    [navigate]
  )

  const loadDashboard = async (sourceFilter: SourceCode | 'all' = selectedSource) => {
    setLoading(true)
    setDataError(null)
    try {
      const [overviewData, listingsData, issuesData] = await Promise.all([
        getAdminOverview(),
        getAdminListings(sourceFilter === 'all' ? undefined : sourceFilter),
        getAdminIssues()
      ])
      setOverview(overviewData)
      setListings(listingsData)
      setIssues(issuesData)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load admin data'
      if (isAdminAuthErrorMessage(message)) {
        endSession('api')
        return
      }
      setDataError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard()
    }
    // Intentionally only when auth flips; source changes call loadDashboard explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const activityFlushRef = useRef(0)
  const flushIdleActivity = useCallback(() => {
    const now = Date.now()
    if (now - activityFlushRef.current < 10_000) return
    activityFlushRef.current = now
    adminTokenStorage.touchActivity()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    const opts: AddEventListenerOptions = { passive: true }
    const onActivity = () => flushIdleActivity()
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((ev) => window.addEventListener(ev, onActivity, opts))
    return () => events.forEach((ev) => window.removeEventListener(ev, onActivity))
  }, [isAuthenticated, flushIdleActivity])

  useEffect(() => {
    if (!isAuthenticated) return
    const id = window.setInterval(() => {
      const status = checkAdminSession()
      if (status.ok) return
      if (status.reason === 'token_expired') endSession('token_expired')
      else if (status.reason === 'idle') endSession('idle')
      else endSession('api')
    }, 15_000)
    return () => window.clearInterval(id)
  }, [isAuthenticated, endSession])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ADMIN_TOKEN_STORAGE_KEY || e.newValue !== null) return
      if (!isAuthedRef.current) return
      endSession('other_tab')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [endSession])

  const onLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setAuthError(null)
    setLoading(true)
    try {
      const response = await adminLogin(username, password)
      adminTokenStorage.setSession(response.token, response.expires_at)
      setSessionNotice(null)
      setIsAuthenticated(true)
      setUsername('')
      setPassword('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setAuthError(message)
    } finally {
      setLoading(false)
    }
  }

  const onToggleSource = async (sourceCode: SourceCode, enabled: boolean) => {
    try {
      setLoading(true)
      await toggleSourceEnabled(sourceCode, enabled)
      await loadDashboard(selectedSource)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update source'
      if (isAdminAuthErrorMessage(message)) {
        endSession('api')
        return
      }
      setDataError(message)
    } finally {
      setLoading(false)
    }
  }

  const onSignOut = () => endSession('logout')

  const sourceStatusMap = useMemo(() => {
    const map = new Map<SourceCode, AdminOverview['sources'][number]>()
    overview?.sources.forEach((source) => map.set(source.source_code, source))
    return map
  }, [overview])

  if (!isAuthenticated) {
    return (
      <AdminShell heroSubtitle="Sign in with your administrator account to manage sources and listings.">
        <main className="admin-page admin-login-wrap">
          <div className="admin-login-card">
            <h1>Sign in</h1>
            <p>Use your admin username and password.</p>
            <form onSubmit={onLogin}>
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {sessionNotice && <p className="admin-error admin-session-notice">{sessionNotice}</p>}
              {authError && <p className="admin-error">{authError}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </main>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      heroSubtitle="Manage marketplace sources and monitor imported listings."
      adminAuthenticated
      onAdminSignOut={onSignOut}
    >
      <main className="admin-page admin-main">
        <div className="admin-main-inner">
          {loading && <div className="admin-loading-banner" aria-hidden />}

          {dataError && <p className="admin-error">{dataError}</p>}

          <section className="admin-grid">
            <article className="admin-card">
              <h2>Source controls</h2>
              {SOURCES.map((sourceCode) => {
                const source = sourceStatusMap.get(sourceCode)
                const connected = Boolean(source?.connected)
                return (
                  <div className="source-row" key={sourceCode}>
                    <div>
                      <h3>{sourceCode.toUpperCase()}</h3>
                      <p className="source-row-meta">
                        <span
                          className={`admin-status-dot ${connected ? 'admin-status-dot--on' : 'admin-status-dot--off'}`}
                          aria-hidden
                        />
                        <span>{connected ? 'Connected' : 'Not connected'}</span>
                        <span aria-hidden>·</span>
                        <span>{source?.listing_count ?? 0} listings</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className={source?.enabled ? 'danger-btn' : 'primary-btn'}
                      onClick={() => onToggleSource(sourceCode, !(source?.enabled ?? true))}
                      disabled={loading}
                    >
                      {source?.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                )
              })}
            </article>

            <article className="admin-card">
              <h2>Import summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-item-label">Total listings</span>
                  <span className="summary-item-value">{overview?.summary.total_listings ?? 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Missing titles</span>
                  <span className="summary-item-value">{overview?.summary.missing_title ?? 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Invalid prices</span>
                  <span className="summary-item-value">{overview?.summary.invalid_price ?? 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Missing images</span>
                  <span className="summary-item-value">{overview?.summary.missing_image ?? 0}</span>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-card">
            <div className="table-header admin-card-section-title">
              <h2>Imported listings</h2>
              <select
                className="admin-select"
                value={selectedSource}
                onChange={(e) => {
                  const value = e.target.value as SourceCode | 'all'
                  setSelectedSource(value)
                  void loadDashboard(value)
                }}
              >
                <option value="all">All sources</option>
                {SOURCES.map((source) => (
                  <option value={source} key={source}>
                    {source.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Title</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td>
                        <span className="admin-source-badge">{listing.source_code.toUpperCase()}</span>
                      </td>
                      <td>{listing.title || 'Untitled'}</td>
                      <td>{listing.brand || '—'}</td>
                      <td>{formatPrice(listing.price_cents, listing.currency)}</td>
                      <td>
                        <span className={conditionPillClass(listing.condition)}>
                          {listing.condition || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!listings.length && (
                    <tr>
                      <td colSpan={5}>No listings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card">
            <h2>Issues</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Listing</th>
                    <th>Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={`${issue.listing_id}-${issue.issue_type}`}>
                      <td>
                        <span className="admin-source-badge">{issue.source_code.toUpperCase()}</span>
                      </td>
                      <td>{issue.title || issue.listing_id}</td>
                      <td>{issue.issue_message}</td>
                    </tr>
                  ))}
                  {!issues.length && (
                    <tr>
                      <td colSpan={3}>No issues detected.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  )
}

export default AdminPage
