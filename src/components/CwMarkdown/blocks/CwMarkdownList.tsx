import type { CwMarkdownListBlock } from '../types'
import { useCwMarkdownContext } from '../context'
import { CwMarkdownInlineRenderer } from '../inlines/CwMarkdownInlineRenderer'

export interface CwMarkdownListProps {
  block: CwMarkdownListBlock
}

export function CwMarkdownList({ block }: CwMarkdownListProps) {
  const ctx = useCwMarkdownContext()
  const listClass = [
    ctx.styles.list,
    block.ordered ? ctx.styles.listOrdered : ctx.styles.listUnordered,
  ]
    .filter(Boolean)
    .join(' ')

  const items = block.items.map((item, i) => (
    <li key={i} className={ctx.styles.listItem}>
      <CwMarkdownInlineRenderer nodes={item} />
    </li>
  ))

  if (block.ordered) {
    return (
      <ol
        className={listClass}
        start={block.start != null ? block.start : undefined}
      >
        {items}
      </ol>
    )
  }

  return <ul className={listClass}>{items}</ul>
}

export default CwMarkdownList
