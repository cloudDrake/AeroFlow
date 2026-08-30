import type { Request, Response } from 'express'
import { requireSupabaseSession } from '../lib/supabase.js'
import { listFlightsForTenant } from '../services/flightService.js'
import { BaseController } from './baseController.js'

export class FlightController extends BaseController {
  public async getFlights(req: Request, res: Response) {
    try {
      const user = await requireSupabaseSession(req)

      if (!user) {
        this.unauthorized(res)
        return
      }

      // TODO: Should this be from query?
      const tenantId = req.query.tenant as string | undefined

      if (!tenantId) {
        this.badRequest(res, 'Missing tenant query param')
        return
      }

      const flights = await listFlightsForTenant(user.id, tenantId)
      res.json(flights)
    } catch (error) {
      this.serverError(res, error, 'flights', 'Unable to load flights')
    }
  }
}

export const flightController = new FlightController()
export const getFlights = flightController.getFlights.bind(flightController)
