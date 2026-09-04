import { Router } from 'express'

import { flightController } from '../controllers/flightController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, flightController.getFlights)

export default router
