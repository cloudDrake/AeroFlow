import { supabase } from '../lib/supabase.js'
import { TenantRecord, TenantRow, normalizeTenantList } from '../lib/tenantHelpers.js'

export class TenantService {
  constructor() {}

  public listAccessibleTenantsForUser = async (userId: string): Promise<TenantRecord[]> => {
    return this.getAccessibleTenants(userId)
  }

  private getAccessibleTenants = async (userId: string): Promise<TenantRecord[]> => {
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

  public isValidTenantIdFromUser = async (userId: string, tenantId: string): Promise<boolean> => {
    if (!supabase) {
      return false
    }

    const { data, error } = await supabase
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single()

    if (error || !data) {
      return false
    }

    return data.tenant_id === tenantId
  }
}
