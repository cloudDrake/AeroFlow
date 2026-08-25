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
    <div className="min-h-screen space-y-6 p-5 md:p-8">
      <header className="glass-panel flex flex-col gap-4 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-blue-300">Multi-tenant ops</p>
          <h1 className="text-2xl font-semibold text-slate-50">Flight Planner</h1>
        </div>

        <div className="flex items-center gap-3">
          {!sessionReady ? (
            <div className="min-w-[320px] space-y-2">
              <span className="text-xs font-medium text-slate-300">Sign in</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="password"
                  className="w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                <button
                  onClick={signIn}
                  className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)] transition hover:brightness-110"
                >
                  Login
                </button>
              </div>
              {authError && <small className="block text-xs text-rose-300">{authError}</small>}
            </div>
          ) : (
            <label className="flex min-w-[220px] flex-col gap-2">
              <span className="text-xs font-medium text-slate-300">Tenant</span>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400"
              >
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

      <main className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="glass-panel rounded-[1.5rem] p-5">
          <h2 className="mb-4 text-xl font-semibold text-slate-50">Flight brief</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300">Tenant</label>
              <input value={tenant?.name ?? 'Unknown tenant'} readOnly className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300">Region</label>
              <input value={tenant?.region ?? 'n/a'} readOnly className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300">Departure</label>
              <input value="2026-08-25T08:00" readOnly className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300">Aircraft</label>
              <select defaultValue="A320" className="rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none">
                <option>A320</option>
                <option>B737</option>
                <option>A350</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.35)] transition hover:brightness-110">Generate plan</button>
            <button className="rounded-xl border border-slate-600/80 bg-slate-950/60 px-4 py-2.5 font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">Save brief</button>
          </div>

          <ul className="mt-5 grid gap-3">
            {isLoading && <li className="rounded-xl border border-slate-700/80 bg-slate-950/40 px-4 py-3 text-slate-300">Loading flights...</li>}
            {isError && <li className="rounded-xl border border-slate-700/80 bg-slate-950/40 px-4 py-3 text-slate-300">Unable to load flights for this tenant.</li>}
            {!isLoading && !isError && flights.map((flight) => (
              <li key={flight.id} className="grid gap-2 rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-base font-semibold text-slate-100">{flight.id}</strong>
                  <span className={`status-pill ${
                    flight.status === 'ready' ? 'bg-emerald-500/15 text-emerald-300' :
                    flight.status === 'pending' ? 'bg-yellow-500/15 text-yellow-300' :
                    'bg-rose-500/15 text-rose-300'
                  }`}>
                    {flight.status}
                  </span>
                </div>
                <span className="text-sm text-slate-300">{flight.route}</span>
                <span className="text-sm text-slate-300">Aircraft {flight.aircraft}</span>
                <span className="text-sm text-slate-300">ETA {flight.eta}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="glass-panel grid gap-3 rounded-[1.5rem] p-5">
          <h2 className="text-xl font-semibold text-slate-50">Operations overview</h2>

          <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <span className="text-sm text-slate-300">Flights active</span>
            <strong className="mt-2 block text-3xl font-semibold text-slate-50">{flights.length}</strong>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <span className="text-sm text-slate-300">Fuel reserve</span>
            <strong className="mt-2 block text-3xl font-semibold text-slate-50">64%</strong>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <span className="text-sm text-slate-300">Weather risk</span>
            <strong className="mt-2 block text-3xl font-semibold text-slate-50">Low</strong>
          </div>
        </aside>
      </main>
    </div>
  )
}
