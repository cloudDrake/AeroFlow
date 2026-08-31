import type { Request, Response } from 'express'
import { requireSupabaseSession } from '../lib/supabase.js'
import { TenantService } from '../services/tenantService.js'
import { BaseController } from './baseController.js'

export class TenantController extends BaseController {
  private tenantService = new TenantService()

  public getTenants = async (req: Request, res: Response) => {
    try {
      const user = await requireSupabaseSession(req)

      if (!user) {
        this.unauthorized(res)
        return
      }

      const tenants = await this.tenantService.listAccessibleTenantsForUser(user.id)
      res.json(tenants)
    } catch (error) {
      this.serverError(res, error, 'tenants', `Unable to load tenants ${error}`)
    }
  }
}
