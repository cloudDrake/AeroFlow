import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentSession, signInWithSupabase, supabase } from './lib/supabase'

type Tenant = {
  id: string
  name: string
  region: string
}

type Flight = {
  id: string
  route: string
  status: 'ready' | 'pending' | 'alert'
  eta: string
  aircraft: string
  tenantId: string
}

async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const payload = await response.json() as T | { data?: T } | null

  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T }).data
  }

  if (Array.isArray(payload)) {
    return payload as T
  }

  return (payload ?? []) as T
}

export default function App() {
  const [email, setEmail] = useState('demo@northstar.air')
  const [password, setPassword] = useState('password123')
  const [sessionReady, setSessionReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    let active = true

    getCurrentSession().then(({ data }) => {
      if (!active) {
        return
      }

      setSessionReady(Boolean(data.session))
      if (data.session?.user?.email) {
        setEmail(data.session.user.email)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const signIn = async () => {
    setAuthError(null)

    try {
      await signInWithSupabase(email, password)
      setSessionReady(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in')
      setSessionReady(false)
    }
  }

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    enabled: !!supabase && sessionReady,
    queryFn: async () => {
      const { data: sessionData } = await getCurrentSession()
      const token = sessionData.session?.access_token
      return fetchJson<Tenant[]>('http://localhost:4000/api/tenants', token)
    }
  })

  const { data: flights = [], isLoading, isError } = useQuery<Flight[]>({
    queryKey: ['flights', tenantId],
    enabled: !!supabase && sessionReady && !!tenantId,
    queryFn: async () => {
      const { data: sessionData } = await getCurrentSession()
      const token = sessionData.session?.access_token
      return fetchJson<Flight[]>(`http://localhost:4000/api/flights?tenant=${tenantId}`, token)
    }
  })

  useEffect(() => {
    if (tenants.length > 0 && !tenantId) {
      setTenantId(tenants[0].id)
    }
  }, [tenantId, tenants])

  const tenant = useMemo(
    () => tenants.find((item) => item.id === tenantId) ?? tenants[0],
    [tenantId, tenants]
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Multi-tenant ops</p>
          <h1>Flight Planner</h1>
        </div>

        <div className="header-controls">
          {!sessionReady ? (
            <div className="field compact-field">
              <span>Sign in</span>
              <div className="button-row" style={{ marginTop: 0 }}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
                <button className="primary" onClick={signIn}>Login</button>
              </div>
              {authError && <small style={{ color: '#fca5a5' }}>{authError}</small>}
            </div>
          ) : (
            <label className="field compact-field">
              <span>Tenant</span>
              <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                {tenants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <main className="dashboard">
        <section className="panel">
          <h2>Flight brief</h2>

          <div className="grid">
            <div className="field">
              <label>Tenant</label>
              <input value={tenant?.name ?? 'Unknown tenant'} readOnly />
            </div>
            <div className="field">
              <label>Region</label>
              <input value={tenant?.region ?? 'n/a'} readOnly />
            </div>
            <div className="field">
              <label>Departure</label>
              <input value="2026-08-25T08:00" readOnly />
            </div>
            <div className="field">
              <label>Aircraft</label>
              <select defaultValue="A320">
                <option>A320</option>
                <option>B737</option>
                <option>A350</option>
              </select>
            </div>
          </div>

          <div className="button-row">
            <button className="primary">Generate plan</button>
            <button className="secondary">Save brief</button>
          </div>

          <ul className="flights-list">
            {isLoading && <li>Loading flights...</li>}
            {isError && <li>Unable to load flights for this tenant.</li>}
            {!isLoading && !isError && flights.map((flight) => (
              <li key={flight.id}>
                <div className="flight-header">
                  <strong>{flight.id}</strong>
                  <span className={`status ${flight.status}`}>{flight.status}</span>
                </div>
                <span>{flight.route}</span>
                <span>Aircraft {flight.aircraft}</span>
                <span>ETA {flight.eta}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="panel summary-card">
          <h2>Operations overview</h2>
          <div className="metric">
            <span>Flights active</span>
            <strong>{flights.length}</strong>
          </div>
          <div className="metric">
            <span>Fuel reserve</span>
            <strong>64%</strong>
          </div>
          <div className="metric">
            <span>Weather risk</span>
            <strong>Low</strong>
          </div>
        </aside>
      </main>
    </div>
  )
}
