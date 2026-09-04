import { useMemo, useState } from 'react'
import moment, { type Moment } from 'moment'

import { toLocalDateTimeValue } from '../lib/format'
import { parseFlightTime } from '../lib/flightTime'
import type { Flight } from '../types/flight'

export function useFlightTimeline(flights: Flight[]) {
  const [rangeStart, setRangeStart] = useState(() =>
    toLocalDateTimeValue(moment().subtract(6, 'hours').toDate())
  )
  const [rangeEnd, setRangeEnd] = useState(() =>
    toLocalDateTimeValue(moment().add(18, 'hours').toDate())
  )
  const [visibleStart, setVisibleStart] = useState<Moment>(() => moment().subtract(6, 'hours'))
  const [visibleEnd, setVisibleEnd] = useState<Moment>(() => moment().add(18, 'hours'))

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

  const handleRangeStartChange = (value: string) => {
    const nextStartMs = new Date(value).getTime()
    const nextEndMs = new Date(rangeEnd).getTime()

    if (Number.isFinite(nextStartMs) && Number.isFinite(nextEndMs) && nextEndMs > nextStartMs) {
      setRangeStart(value)
      setVisibleStart(moment(nextStartMs))
      setVisibleEnd(moment(nextEndMs))
    }
  }

  const handleRangeEndChange = (value: string) => {
    const nextEndMs = new Date(value).getTime()
    const nextStartMs = new Date(rangeStart).getTime()

    if (Number.isFinite(nextEndMs) && Number.isFinite(nextStartMs) && nextEndMs > nextStartMs) {
      setRangeEnd(value)
      setVisibleStart(moment(nextStartMs))
      setVisibleEnd(moment(nextEndMs))
    }
  }

  const handleTimeChange = (start: number, end: number) => {
    setVisibleStart(moment(start))
    setVisibleEnd(moment(end))
    setRangeStart(moment(start).format('YYYY-MM-DDTHH:mm'))
    setRangeEnd(moment(end).format('YYYY-MM-DDTHH:mm'))
  }

  return {
    rangeStart,
    rangeEnd,
    visibleStart,
    visibleEnd,
    aircraftGroups,
    timelineItems,
    handleRangeStartChange,
    handleRangeEndChange,
    handleTimeChange
  }
}
