export async function fetchJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const payload = (await response.json()) as T | { data?: T } | null

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T }).data
  }

  if (Array.isArray(payload)) {
    return payload as T
  }

  return (payload ?? []) as T
}
