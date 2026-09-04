import { parseCass723 } from '../parse.js'
import { fetchCass723 } from '../sources/transportCanada.js'

async function main() {
  console.log('Fetching CASS 723...\n')

  const source = await fetchCass723()

  console.log(`✓ ${source.code}`)
  console.log(`✓ ${source.title}`)
  console.log(`✓ ${source.html.length.toLocaleString()} characters`)

  const sections = parseCass723(source.html)

  console.log(`✓ Found ${sections.length} sections\n`)

  for (const section of sections) {
    console.log(`\n=== ${section.sectionNumber} ${section.title} ===`)

    for (const block of section.blocks) {
      switch (block.type) {
        case 'paragraph':
          console.log(`P: ${block.text}`)
          break

        case 'list':
          console.log(`${block.ordered ? 'OL' : 'UL'}:`, block.items)
          break

        case 'table':
          console.log('TABLE:')
          console.table({
            headers: block.headers,
            rows: block.rows
          })
          break
      }
    }
  }
}

try {
  await main()
} catch (error) {
  console.error('Regulatory ingestion failed:')
  console.error(error)
  process.exit(1)
}
