import type { Flight } from '../../types/flight'
import { StatusBadge } from '../ui/StatusBadge'

import { OpsStatCard } from './OpsStatCard'

type SelectedFlightCardProps = {
  flight: Flight | null
}

export function SelectedFlightCard({ flight }: SelectedFlightCardProps) {
  return (
    <OpsStatCard label="Selected flight">
      {flight ? (
        <div className="mt-3 space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-base text-slate-50">{flight.id}</strong>
            <StatusBadge status={flight.status} />
          </div>
          <div>Route: {flight.route}</div>
          <div>Aircraft: {flight.aircraft}</div>
          <div>ETA: {flight.eta}</div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-slate-300">No flight selected.</div>
      )}
    </OpsStatCard>
  )
}
