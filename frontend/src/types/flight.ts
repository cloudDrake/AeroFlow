export type FlightStatus = 'ready' | 'pending' | 'alert'

export type Flight = {
  id: string
  flight_number: string
  departure_airport?: string
  arrival_airport?: string
  route?: string
  status: FlightStatus
  eta: string
  aircraft: string
  tenantId?: string
  scheduled_departure?: string
  scheduled_arrival?: string
}
