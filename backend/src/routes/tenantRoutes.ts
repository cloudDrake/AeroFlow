import { Router } from 'express'

import { tenantController } from '../controllers/tenantController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, tenantController.getTenants)

export default router
