import { getFlightsForTenant } from '../lib/supabase.js'

export async function listFlightsForTenant(userId: string, tenantId: string) {
  return getFlightsForTenant(userId, tenantId)
}
