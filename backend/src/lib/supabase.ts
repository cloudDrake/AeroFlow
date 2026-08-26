import { createClient, type User } from '@supabase/supabase-js'
import type { Request } from 'express'
import dotenv from 'dotenv'
import { normalizeTenantList, type TenantRecord, type TenantRow } from './tenantHelpers.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabase =
  supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

export async function requireSupabaseSession(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return null
  }

  if (!supabase) {
    throw new Error('Supabase service credentials are not configured.')
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  return data.user
}

export async function getAccessibleTenants(userId: string): Promise<TenantRecord[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, tenants:tenant_id (id, slug, name, region)')
    .eq('user_id', userId)

  if (error || !data) {
    return []
  }

  return data.flatMap((row: TenantRow) => normalizeTenantList(row.tenants))
}

export async function getFlightsForTenant(userId: string, tenantId: string) {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)

  if (error || !data || data.length === 0) {
    return []
  }

  const { data: flightData, error: flightsError } = await supabase
    .from('flights')
    .select('*')
    .eq('tenant_id', tenantId)

  if (flightsError) {
    return []
  }

  return flightData ?? []
}
