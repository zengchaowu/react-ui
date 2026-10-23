import type { CwMarkdownHeadingBlock } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from '../inlines/CwMarkdownInlineRenderer'

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

export interface CwMarkdownHeadingProps {
  block: CwMarkdownHeadingBlock
}

export function CwMarkdownHeading({ block }: CwMarkdownHeadingProps) {
  const ctx = useCwMarkdownContext()
  const HeadingTag = HEADING_TAGS[block.level - 1]

  const headingLevelClass: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
    1: ctx.styles.heading1,
    2: ctx.styles.heading2,
    3: ctx.styles.heading3,
    4: ctx.styles.heading4,
    5: ctx.styles.heading5,
    6: ctx.styles.heading6,
  }

  return (
    <HeadingTag
      className={[ctx.styles.heading, headingLevelClass[block.level]]
        .filter(Boolean)
        .join(' ')}
    >
      <CwMarkdownInlineRenderer nodes={block.content} />
    </HeadingTag>
  )
}

export default CwMarkdownHeading
