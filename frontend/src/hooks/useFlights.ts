import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchJson } from '../lib/api'
import { getCurrentSession, supabase } from '../lib/supabase'
import type { Flight } from '../types/flight'

export function useFlights(sessionReady: boolean, effectiveTenantId: string) {
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

  const selectedFlight = useMemo(() => flights[0] ?? null, [flights])

  return {
    flights,
    selectedFlight
  }
}
