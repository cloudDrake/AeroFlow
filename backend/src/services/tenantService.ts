import type { TenantRecord } from '../types/tenant.js'
import { TenantRepository } from '../repositories/tenant.repository.js'

export class TenantService {
  private tenantRepository = new TenantRepository()

  async listAccessibleTenantsForUser(userId: string): Promise<TenantRecord[]> {
    return this.tenantRepository.findAccessibleTenants(userId)
  }

  async isValidTenantIdFromUser(userId: string, tenantId: string): Promise<boolean> {
    return this.tenantRepository.hasMembership(userId, tenantId)
  }
}
