import type { Request, Response } from 'express'

import { TenantService } from '../services/tenantService.js'
import { BaseController } from './baseController.js'

export class TenantController extends BaseController {
  private tenantService = new TenantService()

  getTenants = async (req: Request, res: Response) => {
    try {
      const tenants = await this.tenantService.listAccessibleTenantsForUser(req.user!.id)
      res.json(tenants)
    } catch (error) {
      this.serverError(res, error, 'tenants', 'Unable to load tenants')
    }
  }
}

export const tenantController = new TenantController()
