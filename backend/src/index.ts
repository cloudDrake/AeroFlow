import express from 'express'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

async function requireSupabaseSession(req: express.Request) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return null
  }

  if (!supabase) {
    throw new Error('Supabase service credentials are not configured.')
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  return data.user
}

async function getAccessibleTenants(userId: string) {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, tenants:tenant_id (id, slug, name, region)')
    .eq('user_id', userId)

  if (error || !data) {
    return []
  }

  return data
    .map((row: any) => row.tenants)
    .filter(Boolean)
}

async function getFlightsForTenant(userId: string, tenantId: string) {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)

  if (error || !data || data.length === 0) {
    return []
  }

  const { data: flightData, error: flightsError } = await supabase
    .from('flights')
    .select('*')
    .eq('tenant_id', tenantId)

  if (flightsError) {
    return []
  }

  return flightData ?? []
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'flight-planner-api' })
})

app.get('/api/tenants', async (req, res) => {
  try {
    const user = await requireSupabaseSession(req)

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const tenants = await getAccessibleTenants(user.id)
    res.json(tenants)
  } catch (error) {
    console.error('tenants error', error)
    res.status(500).json({ error: 'Unable to load tenants' })
  }
})

app.get('/api/flights', async (req, res) => {
  try {
    const user = await requireSupabaseSession(req)

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const tenantId = req.query.tenant as string | undefined

    if (!tenantId) {
      res.status(400).json({ error: 'Missing tenant query param' })
      return
    }

    const flights = await getFlightsForTenant(user.id, tenantId)
    res.json(flights)
  } catch (error) {
    console.error('flights error', error)
    res.status(500).json({ error: 'Unable to load flights' })
  }
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
