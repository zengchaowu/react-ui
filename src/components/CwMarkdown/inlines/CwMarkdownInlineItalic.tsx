import type { InlineItalicNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from './CwMarkdownInlineRenderer'

export interface CwMarkdownInlineItalicProps {
  node: InlineItalicNode
}

export function CwMarkdownInlineItalic({ node }: CwMarkdownInlineItalicProps) {
  const ctx = useCwMarkdownContext()
  const sizeClass =
    ctx.size === 'small'
      ? ctx.styles.sizeSmall
      : ctx.size === 'large'
        ? ctx.styles.sizeLarge
        : ctx.styles.sizeMedium

  return (
    <span
      className={[ctx.styles.inlineItalic, sizeClass].filter(Boolean).join(' ')}
    >
      <CwMarkdownInlineRenderer nodes={node.children} />
    </span>
  )
}

export default CwMarkdownInlineItalic
