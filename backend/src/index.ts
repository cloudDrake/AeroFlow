import express from 'express'
import healthRoutes from './routes/healthRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'
import flightRoutes from './routes/flightRoutes.js'

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

app.use('/health', healthRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/flights', flightRoutes)

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
