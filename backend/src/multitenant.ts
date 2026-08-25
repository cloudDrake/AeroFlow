export type TenantContext = {
  tenantId: string
}

export function getTenantId(headers: Headers | Record<string, string | string[] | undefined>): string {
  if (headers instanceof Headers) {
    const headerValue = headers.get('x-tenant-id') || headers.get('X-Tenant-Id')
    return headerValue || 'northstar'
  }

  const rawHeader = headers['x-tenant-id'] || headers['X-Tenant-Id']
  const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
  return headerValue || 'northstar'
}

export function tenantResponse<T>(tenantId: string, payload: T) {
  return {
    tenantId,
    data: payload
  }
}
