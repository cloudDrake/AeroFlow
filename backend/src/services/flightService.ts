import { FlightRepository } from '../repositories/flight.repository.js'
import type { FlightRecord } from '../types/flight.js'
import { TenantService } from './tenantService.js'

export class FlightService {
  private flightRepository = new FlightRepository()
  private tenantService = new TenantService()

  async listFlightsForTenant(userId: string, tenantId: string): Promise<FlightRecord[]> {
    const isValidTenantId = await this.tenantService.isValidTenantIdFromUser(userId, tenantId)
    if (!isValidTenantId) {
      return []
    }

    return this.flightRepository.findByTenantId(tenantId)
  }
}
