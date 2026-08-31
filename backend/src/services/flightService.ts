import { FlightRecord } from '../lib/flightHelpers.js'
import { supabase } from '../lib/supabase.js'
import { TenantService } from './tenantService.js'

export class FlightService {
  tenantService: TenantService = new TenantService()
  constructor() {}

  /**
   *
   * @param userId
   * @param tenantId
   * @returns FlightRecord[]
   */
  public listFlightsForTenant = async (userId: string, tenantId: string) => {
    // Validate if user has access to the tenant
    const isValidTenantId = await this.tenantService.isValidTenantIdFromUser(userId, tenantId)
    if (!isValidTenantId) {
      return []
    }

    // Get actual flight data for tenant
    const flightData = await this.getFlightDataForTenant(tenantId)
    return flightData ?? []
  }

  /**
   *
   * @param tenantId
   * @returns
   */
  private getFlightDataForTenant = async (tenantId: string): Promise<FlightRecord[]> => {
    if (!supabase) {
      return []
    }

    const { data, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .eq('tenant_id', tenantId)

    if (flightsError) {
      return []
    }

    return data ?? []
  }
}
