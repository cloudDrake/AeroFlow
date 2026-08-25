import { Router } from 'express'
import { getTenants } from '../controllers/tenantController.js'

const router = Router()

router.get('/', getTenants)

export default router
