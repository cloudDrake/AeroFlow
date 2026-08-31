/** TYPES */
export type FlightRecord = {
  id: string
  tenant_id: string
  flight_number: string
  departure_airport: string
  arrival_airport: string
  route: string
  status: 'ready' | 'pending' | 'alert'
  eta: string
  aircraft: string
  created_at?: string
}

export function isFlightRecord(value: unknown): value is FlightRecord {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'tenant_id' in value &&
    'flight_number' in value &&
    'departure_airport' in value &&
    'arrival_airport' in value &&
    'status' in value &&
    'eta' in value &&
    'aircraft' in value
  )
}
