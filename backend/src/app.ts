import express from 'express'

import { corsMiddleware } from './middleware/cors.js'
import flightRoutes from './routes/flightRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'

export function createApp() {
  const app = express()

  app.use(corsMiddleware)
  app.use('/health', healthRoutes)
  app.use('/api/tenants', tenantRoutes)
  app.use('/api/flights', flightRoutes)

  return app
}
