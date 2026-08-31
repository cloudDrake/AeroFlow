import { Router } from 'express'
import { FlightController } from '../controllers/flightController.js'

const router = Router()

const flightController = new FlightController()
router.get('/', flightController.getFlights)

export default router
