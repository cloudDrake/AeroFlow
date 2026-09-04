const CASS_723_URL =
  'https://tc.canada.ca/en/corporate-services/acts-regulations/list-regulations/canadian-aviation-regulations-sor-96-433/standards/standard-723-air-taxi-aeroplanes-canadian-aviation-regulations-cars'

export type RegulatorySource = {
  code: string
  title: string
  url: string
  html: string
}

export async function fetchCass723(): Promise<RegulatorySource> {
  const response = await fetch(CASS_723_URL, {
    headers: {
      'User-Agent': 'AeroFlow Regulatory Ingestion/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch CASS 723: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()

  if (!html.trim()) {
    throw new Error('CASS 723 response contained no HTML')
  }

  return {
    code: 'CASS-723',
    title: 'Standard 723 - Air Taxi: Aeroplanes',
    url: CASS_723_URL,
    html
  }
}
