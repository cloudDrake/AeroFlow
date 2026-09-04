import type { Moment } from 'moment'

import { formatClock } from '../../lib/format'
import type { Flight } from '../../types/flight'

import { OpsStatCard } from './OpsStatCard'
import { SelectedFlightCard } from './SelectedFlightCard'

type OperationsOverviewProps = {
  flights: Flight[]
  selectedFlight: Flight | null
  visibleStart: Moment
  visibleEnd: Moment
  onClose: () => void
}

export function OperationsOverview({
  flights,
  selectedFlight,
  visibleStart,
  visibleEnd,
  onClose
}: OperationsOverviewProps) {
  return (
    <aside className="glass-panel fixed right-6 top-24 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-[1.5rem] p-5 shadow-[0_30px_80px_rgba(2,6,23,0.8)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-50">Operations overview</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-600/80 bg-slate-950/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300"
        >
          Close
        </button>
      </div>

      <div className="grid gap-3">
        <OpsStatCard label="Flights active">
          <strong className="mt-2 block text-3xl font-semibold text-slate-50">
            {flights.length}
          </strong>
        </OpsStatCard>

        <OpsStatCard label="Fuel reserve">
          <strong className="mt-2 block text-3xl font-semibold text-slate-50">64%</strong>
        </OpsStatCard>

        <OpsStatCard label="Weather risk">
          <strong className="mt-2 block text-3xl font-semibold text-slate-50">Low</strong>
        </OpsStatCard>

        <SelectedFlightCard flight={selectedFlight} />

        <OpsStatCard label="Current window">
          <strong className="mt-2 block text-sm font-semibold text-slate-50">
            {formatClock(visibleStart.toDate())} – {formatClock(visibleEnd.toDate())}
          </strong>
        </OpsStatCard>
      </div>
    </aside>
  )
}
