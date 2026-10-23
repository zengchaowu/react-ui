import type { CwMarkdownParagraphBlock } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from '../inlines/CwMarkdownInlineRenderer'

export interface CwMarkdownParagraphProps {
  block: CwMarkdownParagraphBlock
}

export function CwMarkdownParagraph({ block }: CwMarkdownParagraphProps) {
  const ctx = useCwMarkdownContext()
  const sizeClass =
    ctx.size === 'small'
      ? ctx.styles.sizeSmall
      : ctx.size === 'large'
        ? ctx.styles.sizeLarge
        : ctx.styles.sizeMedium

  return (
    <p
      className={[ctx.styles.paragraph, sizeClass].filter(Boolean).join(' ')}
    >
      <CwMarkdownInlineRenderer nodes={block.content} />
    </p>
  )
}

export default CwMarkdownParagraph
