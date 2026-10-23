import type { InlineCodeNode } from '../types'
import { useCwMarkdownContext } from '../context'

export interface CwMarkdownInlineCodeProps {
  node: InlineCodeNode
}

export function CwMarkdownInlineCode({ node }: CwMarkdownInlineCodeProps) {
  const ctx = useCwMarkdownContext()

  return <code className={ctx.styles.inlineCode}>{node.value}</code>
}

export default CwMarkdownInlineCode
