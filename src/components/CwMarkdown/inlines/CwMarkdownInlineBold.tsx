import type { InlineBoldNode } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from './CwMarkdownInlineRenderer'

export interface CwMarkdownInlineBoldProps {
  node: InlineBoldNode
}

export function CwMarkdownInlineBold({ node }: CwMarkdownInlineBoldProps) {
  const ctx = useCwMarkdownContext()
  const sizeClass =
    ctx.size === 'small'
      ? ctx.styles.sizeSmall
      : ctx.size === 'large'
        ? ctx.styles.sizeLarge
        : ctx.styles.sizeMedium

  return (
    <span
      className={[ctx.styles.inlineBold, sizeClass].filter(Boolean).join(' ')}
    >
      <CwMarkdownInlineRenderer nodes={node.children} />
    </span>
  )
}

export default CwMarkdownInlineBold
