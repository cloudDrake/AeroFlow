import type { ComponentProps } from 'react'
import Timeline from 'react-calendar-timeline'

import { getFlightStatusGradient } from '../../lib/flightStatus'
import type { FlightTimelineItem } from '../../types/timeline'

type ItemRendererProps = Parameters<NonNullable<ComponentProps<typeof Timeline>['itemRenderer']>>[0]

type FlightTimelineItemProps = Pick<ItemRendererProps, 'item' | 'getItemProps'>

export function FlightTimelineItemRenderer({ item, getItemProps }: FlightTimelineItemProps) {
  const { flight } = item as FlightTimelineItem
  const background = getFlightStatusGradient(flight.status)
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
