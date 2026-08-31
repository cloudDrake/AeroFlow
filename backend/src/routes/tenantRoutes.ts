import { Router } from 'express'
import { TenantController } from '../controllers/tenantController.js'

const router = Router()
const tenantController = new TenantController()

router.get('/', tenantController.getTenants)

export default router
