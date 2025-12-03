import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

export interface HeadingNode {
  id: string // Anchor ID (slugified text)
  text: string // Display text
  level: 2 | 3 // Heading level
  children?: HeadingNode[] // H3s nested under H2s
}

/**
 * Slugify text to create URL-safe anchor IDs
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Extract text content from a Lexical node
 */
function extractTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.text || ''
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('')
  }

  return ''
}

/**
 * Extract H2 and H3 headings from Lexical rich text data
 * Returns a hierarchical structure with H3s nested under their parent H2s
 */
export function extractHeadings(lexicalData: DefaultTypedEditorState | null | undefined): HeadingNode[] {
  if (!lexicalData?.root?.children) {
    return []
  }

  const headings: HeadingNode[] = []
  let currentH2: HeadingNode | null = null

  for (const node of lexicalData.root.children) {
    if (node.type === 'heading') {
      const text = extractTextFromNode(node)
      const id = slugify(text)

      if (node.tag === 'h2') {
        const h2Node: HeadingNode = {
          id,
          text,
          level: 2,
          children: [],
        }
        headings.push(h2Node)
        currentH2 = h2Node
      } else if (node.tag === 'h3' && currentH2) {
        const h3Node: HeadingNode = {
          id,
          text,
          level: 3,
        }
        currentH2.children!.push(h3Node)
      }
    }
  }

  return headings
}
