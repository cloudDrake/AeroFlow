import { createServer } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

function sendJson(res: import('node:http').ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  })
  res.end(JSON.stringify(payload))
}

async function requireSupabaseSession(req: import('node:http').IncomingMessage) {
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

  console.log(`Fetched ${flightData.length} flights for tenant ${tenantId}`);
  console.log(`Flight data: ${JSON.stringify(flightData)}`);
  return flightData ?? []
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Missing URL' })
    return
  }

  const requestUrl = new URL(req.url, 'http://localhost')
  const method = req.method || 'GET'

  if (method === 'OPTIONS') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (requestUrl.pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'flight-planner-api' })
    return
  }

  const user = await requireSupabaseSession(req)
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' })
    return
  }

  if (requestUrl.pathname === '/api/tenants') {
    const tenants = await getAccessibleTenants(user.id)
    sendJson(res, 200, tenants)
    return
  }

  if (requestUrl.pathname === '/api/flights') {
    const tenantId = requestUrl.searchParams.get('tenant') || ''

    if (!tenantId) {
      sendJson(res, 400, { error: 'Missing tenant query param' })
      return
    }

    const flights = await getFlightsForTenant(user.id, tenantId)
    sendJson(res, 200, { tenantId, data: flights })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
})

const port = Number(process.env.PORT || 4000)
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
