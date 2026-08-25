import type { Request, Response } from 'express'
import { requireSupabaseSession } from '../lib/supabase.js'
import { listAccessibleTenantsForUser } from '../services/tenantService.js'
import { BaseController } from './baseController.js'

export class TenantController extends BaseController {
  async getTenants(req: Request, res: Response) {
    try {
      const user = await requireSupabaseSession(req)

      if (!user) {
        this.unauthorized(res)
        return
      }

      const tenants = await listAccessibleTenantsForUser(user.id)
      res.json(tenants)
    } catch (error) {
      this.serverError(res, error, 'tenants', 'Unable to load tenants')
    }
  }
}

export const tenantController = new TenantController()
export const getTenants = tenantController.getTenants.bind(tenantController)
