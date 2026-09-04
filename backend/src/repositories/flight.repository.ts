import { supabase } from '../lib/supabase.client.js'
import type { FlightRecord } from '../types/flight.js'

export class FlightRepository {
  async findByTenantId(tenantId: string): Promise<FlightRecord[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase.from('flights').select('*').eq('tenant_id', tenantId)

    if (error) {
      return []
    }

    return data ?? []
  }
}
