import { type ComponentProps, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import moment, { type Moment } from 'moment'
import Timeline, { type TimelineItemBase } from 'react-calendar-timeline'

import 'react-calendar-timeline/dist/style.css'
import { getCurrentSession, signInWithSupabase, supabase } from './lib/supabase'

type Tenant = {
  id: string
  name: string
  region: string
}

type Flight = {
  id: string
  flight_number: string
  departure_airport?: string
  arrival_airport?: string
  route?: string
  status: 'ready' | 'pending' | 'alert'
  eta: string
  aircraft: string
  tenantId?: string
  scheduled_departure?: string
  scheduled_arrival?: string
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function toLocalDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const payload = (await response.json()) as T | { data?: T } | null

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T }).data
  }

  if (Array.isArray(payload)) {
    return payload as T
  }

  return (payload ?? []) as T
}

function parseFlightTime(value?: string): Moment | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const [hours, minutes, seconds = 0] = trimmed.split(':').map(Number)
    return moment().hours(hours).minutes(minutes).seconds(seconds).milliseconds(0)
  }

  const parsed = moment(value)
  return parsed.isValid() ? parsed : null
}

export default function App() {
  const [email, setEmail] = useState('demo@northstar.air')
  const [password, setPassword] = useState('password123')
  const [sessionReady, setSessionReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState('')
  const [selectedFlightId] = useState<string | null>(null)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)
  const [rangeStart, setRangeStart] = useState(() =>
    toLocalDateTimeValue(moment().subtract(6, 'hours').toDate())
  )
  const [rangeEnd, setRangeEnd] = useState(() =>
    toLocalDateTimeValue(moment().add(18, 'hours').toDate())
  )
  const [visibleStart, setVisibleStart] = useState(moment().subtract(6, 'hours'))
  const [visibleEnd, setVisibleEnd] = useState(moment().add(18, 'hours'))

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

  const effectiveTenantId = tenantId || tenants[0]?.id || ''

  const { data: flights = [] } = useQuery<Flight[]>({
    queryKey: ['flights', effectiveTenantId],
    enabled: !!supabase && sessionReady && !!effectiveTenantId,
    queryFn: async () => {
      const { data: sessionData } = await getCurrentSession()
      const token = sessionData.session?.access_token
      return fetchJson<Flight[]>(
        `http://localhost:4000/api/flights?tenant=${effectiveTenantId}`,
        token
      )
    }
  })

  const tenant = useMemo(
    () => tenants.find(item => item.id === effectiveTenantId) ?? tenants[0],
    [effectiveTenantId, tenants]
  )

  const selectedFlight = useMemo(
    () => flights.find(flight => flight.id === selectedFlightId) ?? flights[0] ?? null,
    [flights, selectedFlightId]
  )

  const aircraftGroups = useMemo(() => {
    const uniqueAircraft = Array.from(
      new Set(flights.map(flight => flight.aircraft || 'Unassigned'))
    )
    return uniqueAircraft.map((aircraft, index) => ({
      id: index + 1,
      title: aircraft
    }))
  }, [flights])

  const aircraftLookup = useMemo(() => {
    const lookup = new Map<string, number>()
    aircraftGroups.forEach(group => {
      lookup.set(group.title, group.id)
    })
    return lookup
  }, [aircraftGroups])

  const timelineItems = useMemo(() => {
    return flights.map(flight => {
      const start =
        parseFlightTime(flight.eta) ?? parseFlightTime(flight.scheduled_departure) ?? moment()
      const end = parseFlightTime(flight.scheduled_arrival) ?? start.clone().add(150, 'minutes')

      return {
        id: flight.id,
        group: aircraftLookup.get(flight.aircraft || 'Unassigned') ?? 1,
        title: flight.id,
        start_time: start.clone(),
        end_time: end.clone(),
        flight
      }
    })
  }, [aircraftLookup, flights])

  type FlightTimelineItem = TimelineItemBase<Moment> & {
    flight: Flight
  }

  const itemRenderer = (
    props: Parameters<NonNullable<ComponentProps<typeof Timeline>['itemRenderer']>>[0]
  ) => {
    const { item, getItemProps } = props
    const flight = (item as FlightTimelineItem).flight
    const background =
      flight.status === 'ready'
        ? 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(16,185,129,0.12))'
        : flight.status === 'pending'
          ? 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(245,158,11,0.12))'
          : 'linear-gradient(135deg, rgba(244,63,94,0.28), rgba(244,63,94,0.12))'

    const departureAirport = flight.departure_airport ?? 'DEP'
    const arrivalAirport = flight.arrival_airport ?? 'ARR'
    const flightNumber = flight.flight_number ?? item.title ?? 'FLIGHT'
    return (
      <div
        {...getItemProps({
          style: {
            border: '1px solid rgba(148,163,184,0.45)',
            borderRadius: '12px',
            background,
            boxShadow: '0 18px 45px rgba(15,23,42,0.35)',
            color: '#e2e8f0',
            padding: '0 10px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
          }
        })}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden'
          }}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(226,232,240,0.92)'
            }}
          >
            {departureAirport}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '72px',
            textAlign: 'center',
            flexShrink: 0
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#f8fafc',
              whiteSpace: 'nowrap'
            }}
          >
            {flightNumber}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'hidden',
            textAlign: 'right'
          }}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(226,232,240,0.92)'
            }}
          >
            {arrivalAirport}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-5 md:p-8">
      <header className="glass-panel flex flex-col gap-4 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-blue-300">
            Multi-tenant ops
          </p>
          <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            Aero Flow
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!sessionReady ? (
            <div className="min-w-[320px] space-y-2">
              <span className="text-xs font-medium text-slate-300">Sign in</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email"
                  className="modern-input w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="password"
                  className="modern-input w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                <button
                  onClick={signIn}
                  className="primary-button rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)] transition hover:brightness-110"
                >
                  Login
                </button>
              </div>
              {authError && <small className="block text-xs text-rose-300">{authError}</small>}
            </div>
          ) : (
            <>
              <label className="flex min-w-[220px] flex-col gap-2">
                <span className="text-xs font-medium text-slate-300">Tenant</span>
                <select
                  value={effectiveTenantId}
                  onChange={e => setTenantId(e.target.value)}
                  className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-indigo-400"
                >
                  {tenants.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setIsOverviewOpen(value => !value)}
                className="secondary-button rounded-xl border border-slate-600/80 bg-slate-950/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100"
              >
                Status
              </button>
            </>
          )}
        </div>
      </header>

      <main className="relative flex flex-col gap-6 xl:flex-row xl:items-start">
        <section className="glass-panel flex min-h-[68vh] w-full min-w-0 flex-1 flex-col rounded-[1.5rem] p-5">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">Flight timeline</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                Aircraft schedule
              </p>
            </div>

            <div className="toolbar-panel flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/60 p-2">
              <label
                htmlFor="range-start"
                className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
              >
                <span>From</span>
                <input
                  id="range-start"
                  type="datetime-local"
                  value={rangeStart}
                  onChange={event => {
                    const nextStartMs = new Date(event.target.value).getTime()
                    const nextEndMs = new Date(rangeEnd).getTime()

                    if (
                      Number.isFinite(nextStartMs) &&
                      Number.isFinite(nextEndMs) &&
                      nextEndMs > nextStartMs
                    ) {
                      setRangeStart(event.target.value)
                      setVisibleStart(moment(nextStartMs))
                      setVisibleEnd(moment(nextEndMs))
                    }
                  }}
                  className="modern-input rounded-xl border border-slate-600/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-400"
                />
              </label>
              <label
                htmlFor="range-end"
                className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
              >
                <span>To</span>
                <input
                  id="range-end"
                  type="datetime-local"
                  value={rangeEnd}
                  onChange={event => {
                    const nextEndMs = new Date(event.target.value).getTime()
                    const nextStartMs = new Date(rangeStart).getTime()

                    if (
                      Number.isFinite(nextEndMs) &&
                      Number.isFinite(nextStartMs) &&
                      nextEndMs > nextStartMs
                    ) {
                      setRangeEnd(event.target.value)
                      setVisibleStart(moment(nextStartMs))
                      setVisibleEnd(moment(nextEndMs))
                    }
                  }}
                  className="modern-input rounded-xl border border-slate-600/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-400"
                />
              </label>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-300">
            <span>Drag to pan</span>
            <span>Scroll to zoom</span>
            <span className="rounded-full border border-slate-700/80 bg-slate-950/50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
              {formatShortDate(visibleStart.toDate())} → {formatShortDate(visibleEnd.toDate())}
            </span>
          </div>

          <div className="timeline-modern overflow-hidden rounded-[1.25rem] border border-slate-700/80 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Timeline
              groups={aircraftGroups}
              items={timelineItems}
              visibleTimeStart={visibleStart.valueOf()}
              visibleTimeEnd={visibleEnd.valueOf()}
              onTimeChange={(start, end) => {
                setVisibleStart(moment(start))
                setVisibleEnd(moment(end))
                setRangeStart(moment(start).format('YYYY-MM-DDTHH:mm'))
                setRangeEnd(moment(end).format('YYYY-MM-DDTHH:mm'))
              }}
              itemRenderer={itemRenderer}
              lineHeight={72}
              sidebarWidth={170}
              sidebarContent={
                <div className="flex h-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  Aircraft
                </div>
              }
              itemHeightRatio={0.88}
              canMove={false}
              canResize={false}
              stackItems
              dragSnap={60 * 60 * 1000}
              timeSteps={{ second: 0, minute: 60, hour: 1, day: 1, month: 1, year: 1 }}
              defaultTimeStart={moment().subtract(6, 'hours').valueOf()}
              defaultTimeEnd={moment().add(18, 'hours').valueOf()}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300" htmlFor="tenant-name">
                Tenant
              </label>
              <input
                id="tenant-name"
                value={tenant?.name ?? 'Unknown tenant'}
                readOnly
                className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-300" htmlFor="region">
                Region
              </label>
              <input
                value={tenant?.region ?? 'n/a'}
                readOnly
                className="modern-input rounded-xl border border-slate-600/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="primary-button rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.35)] transition hover:brightness-110">
              Generate plan
            </button>
            <button className="secondary-button rounded-xl border border-slate-600/80 bg-slate-950/60 px-4 py-2.5 font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              Save brief
            </button>
          </div>
        </section>

        {isOverviewOpen && (
          <aside className="glass-panel fixed right-6 top-24 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-[1.5rem] p-5 shadow-[0_30px_80px_rgba(2,6,23,0.8)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-50">Operations overview</h2>
              <button
                type="button"
                onClick={() => setIsOverviewOpen(false)}
                className="rounded-full border border-slate-600/80 bg-slate-950/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3">
              <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-sm text-slate-300">Flights active</span>
                <strong className="mt-2 block text-3xl font-semibold text-slate-50">
                  {flights.length}
                </strong>
              </div>

              <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-sm text-slate-300">Fuel reserve</span>
                <strong className="mt-2 block text-3xl font-semibold text-slate-50">64%</strong>
              </div>

              <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-sm text-slate-300">Weather risk</span>
                <strong className="mt-2 block text-3xl font-semibold text-slate-50">Low</strong>
              </div>

              <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-sm text-slate-300">Selected flight</span>
                {selectedFlight ? (
                  <div className="mt-3 space-y-2 text-sm text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-base text-slate-50">{selectedFlight.id}</strong>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          selectedFlight.status === 'ready'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : selectedFlight.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {selectedFlight.status}
                      </span>
                    </div>
                    <div>Route: {selectedFlight.route}</div>
                    <div>Aircraft: {selectedFlight.aircraft}</div>
                    <div>ETA: {selectedFlight.eta}</div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-300">No flight selected.</div>
                )}
              </div>

              <div className="ops-card rounded-xl border border-slate-700/80 bg-slate-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <span className="text-sm text-slate-300">Current window</span>
                <strong className="mt-2 block text-sm font-semibold text-slate-50">
                  {formatClock(visibleStart.toDate())} – {formatClock(visibleEnd.toDate())}
                </strong>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}
