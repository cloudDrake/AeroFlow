export type RegulatoryBlock =
  | {
      type: 'paragraph'
      text: string
    }
  | {
      type: 'list'
      ordered: boolean
      items: string[]
    }
  | {
      type: 'table'
      headers: string[]
      rows: string[][]
    }

export interface RegulatorySection {
  sectionNumber: string
  title: string
  blocks: RegulatoryBlock[]
}

export const SECTION_PATTERN = /^723\.\d+(?:\.\d+)?\b/
