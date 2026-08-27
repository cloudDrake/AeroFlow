export type TenantRecord = {
  id: string
  slug: string
  name: string
  region: string
}

export type TenantRow = {
  tenants?: TenantRecord[] | TenantRecord | null
}

export function isTenantRecord(value: unknown): value is TenantRecord {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'slug' in value &&
    'name' in value &&
    'region' in value
  )
}

export function normalizeTenantList(value: TenantRow['tenants']): TenantRecord[] {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value.filter(isTenantRecord) : isTenantRecord(value) ? [value] : []
}
