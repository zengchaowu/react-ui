import type { CwMarkdownBlockquoteBlock } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownBlocks } from './CwMarkdownBlocks'

export interface CwMarkdownBlockquoteProps {
  block: CwMarkdownBlockquoteBlock
}

export function CwMarkdownBlockquote({ block }: CwMarkdownBlockquoteProps) {
  const ctx = useCwMarkdownContext()

  return (
    <blockquote className={ctx.styles.blockquote}>
      <CwMarkdownBlocks blocks={block.children} />
    </blockquote>
  )
}

export default CwMarkdownBlockquote
