import type { RegulatoryBlock } from '../types/regulatory.js'
import { SECTION_PATTERN } from '../types/regulatory.js'

export const getRegulatoryBlocks = (heading: Element): RegulatoryBlock[] => {
  const regulatoryBlocks: RegulatoryBlock[] = []
  let current = heading.nextElementSibling

  while (current) {
    if (isSectionHeading(current)) {
      break
    }

    if (current.matches('p')) {
      const text = cleanText(current.textContent)

      if (text) {
        regulatoryBlocks.push({
          type: 'paragraph',
          text
        })
      }
    }

    if (current.matches('ul, ol')) {
      const items = Array.from(current.querySelectorAll(':scope > li'))
        .map(item => cleanText(item.textContent))
        .filter(Boolean)

      if (items.length) {
        regulatoryBlocks.push({
          type: 'list',
          ordered: current.tagName.toLowerCase() === 'ol',
          items
        })
      }
    }

    if (current.matches('table')) {
      regulatoryBlocks.push(parseTable(current))
    }

    current = current.nextElementSibling
  }
  return regulatoryBlocks
}

export const isSectionHeading = (element: Element): boolean => {
  if (!/^H[1-6]$/.test(element.tagName)) {
    return false
  }

  return SECTION_PATTERN.test(cleanText(element.textContent))
}

export const parseTable = (table: Element): RegulatoryBlock => {
  const rows = Array.from(table.querySelectorAll('tr'))

  if (!rows.length) {
    return {
      type: 'table',
      headers: [],
      rows: []
    }
  }

  const firstRow = rows[0]

  const headers = Array.from(firstRow.querySelectorAll('th, td')).map(cell =>
    cleanText(cell.textContent)
  )

  const dataRows = rows
    .slice(1)
    .map(row => Array.from(row.querySelectorAll('th, td')).map(cell => cleanText(cell.textContent)))

  return {
    type: 'table',
    headers,
    rows: dataRows
  }
}

export const cleanText = (text: string | null): string => {
  return text?.replace(/\s+/g, ' ').trim() ?? ''
}
