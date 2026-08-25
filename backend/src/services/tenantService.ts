import { getAccessibleTenants } from '../lib/supabase.js'

export async function listAccessibleTenantsForUser(userId: string) {
  return getAccessibleTenants(userId)
}
