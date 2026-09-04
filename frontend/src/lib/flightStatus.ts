import type { FlightStatus } from '../types/flight'

export const statusBadgeStyles: Record<FlightStatus, string> = {
  ready: 'bg-emerald-500/15 text-emerald-300',
  pending: 'bg-amber-500/15 text-amber-300',
  alert: 'bg-rose-500/15 text-rose-300'
}

export function getFlightStatusGradient(status: FlightStatus): string {
  switch (status) {
    case 'ready':
      return 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(16,185,129,0.12))'
    case 'pending':
      return 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(245,158,11,0.12))'
    case 'alert':
      return 'linear-gradient(135deg, rgba(244,63,94,0.28), rgba(244,63,94,0.12))'
  }
}
