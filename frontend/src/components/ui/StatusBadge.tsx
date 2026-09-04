import type { FlightStatus } from '../../types/flight'
import { statusBadgeStyles } from '../../lib/flightStatus'

type StatusBadgeProps = {
  status: FlightStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${statusBadgeStyles[status]}`}
    >
      {status}
    </span>
  )
}
