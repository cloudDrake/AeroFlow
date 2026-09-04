import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchJson } from '../lib/api'
import { getCurrentSession, supabase } from '../lib/supabase'
import type { Tenant } from '../types/tenant'

export function useTenants(sessionReady: boolean) {
  const [tenantId, setTenantId] = useState('')

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    enabled: !!supabase && sessionReady,
    queryFn: async () => {
      const { data: sessionData } = await getCurrentSession()
      const token = sessionData.session?.access_token
      return fetchJson<Tenant[]>('http://localhost:4000/api/tenants', token)
    }
  })

  const effectiveTenantId = tenantId || tenants[0]?.id || ''

  const tenant = useMemo(
    () => tenants.find(item => item.id === effectiveTenantId) ?? tenants[0],
    [effectiveTenantId, tenants]
  )

  return {
    tenants,
    tenantId,
    setTenantId,
    effectiveTenantId,
    tenant
  }
}
