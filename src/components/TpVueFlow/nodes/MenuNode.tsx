import type { Node, NodeProps } from '@xyflow/react'

export type TpVueFlowMenuNodeData = {
  label: string
  menuItems: Array<{
    label: string
    value: string
  }>
}

export type TpVueFlowMenuFlowNode = Node<TpVueFlowMenuNodeData, 'menu'>

export function MenuNode({ data, selected }: NodeProps<TpVueFlowMenuFlowNode>) {
  return (
    <div
      className={[
        'min-w-[9.375rem] overflow-hidden rounded border-2 border-[var(--border-color)] bg-[var(--bg-color-container)] transition-all duration-200',
        selected ? 'border-[var(--brand-color-6)] ring-2 ring-[var(--brand-color-focus)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-3 py-2 text-sm font-bold text-[var(--text-color-primary)]">
        {data.label}
      </div>
      <div className="max-h-[12.5rem] overflow-y-auto">
        {data.menuItems.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer hairline-border-b border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-color-primary)] transition-colors last:hairline-border-b-0 hover:bg-[var(--bg-color-secondarycomponent-hover)]"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MenuNode
