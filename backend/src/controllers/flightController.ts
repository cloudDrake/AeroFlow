import type { Request, Response } from 'express'

import { FlightService } from '../services/flightService.js'
import { BaseController } from './baseController.js'

export class FlightController extends BaseController {
  private flightService = new FlightService()

  getFlights = async (req: Request, res: Response) => {
    try {
      const tenantId = req.query.tenant as string | undefined

      if (!tenantId) {
        this.badRequest(res, 'Missing tenant query param')
        return
      }

      const flights = await this.flightService.listFlightsForTenant(req.user!.id, tenantId)
      res.json(flights)
    } catch (error) {
      this.serverError(res, error, 'flights', 'Unable to load flights')
    }
  }
}

export const flightController = new FlightController()
