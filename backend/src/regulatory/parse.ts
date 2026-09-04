import { JSDOM } from 'jsdom'

import { cleanText, getRegulatoryBlocks } from './helpers/parseHelper.js'
import type { RegulatoryBlock, RegulatorySection } from './types/regulatory.js'
import { SECTION_PATTERN } from './types/regulatory.js'

export function parseCass723(html: string): RegulatorySection[] {
  const { document } = new JSDOM(html).window

  const sections: RegulatorySection[] = []

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')

  for (const heading of headings) {
    const headingText = cleanText(heading.textContent)

    if (!SECTION_PATTERN.test(headingText)) {
      continue
    }

    const match = headingText.match(/^(723\.\d+(?:\.\d+)?)\s*[-–—:]?\s*(.*)$/i)

    if (!match) {
      continue
    }

    const [, sectionNumber, title] = match

    const regulatoryBlocks: RegulatoryBlock[] = getRegulatoryBlocks(heading)

    sections.push({
      sectionNumber,
      title: title.trim(),
      blocks: regulatoryBlocks
    })
  }

  return sections
}
