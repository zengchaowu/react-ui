import type { Node, NodeProps } from '@xyflow/react'

export type TpVueFlowRectangleNodeData = {
  label: string
  description?: string
}

export type TpVueFlowRectangleFlowNode = Node<TpVueFlowRectangleNodeData, 'rectangle'>

export function RectangleNode({ data, selected }: NodeProps<TpVueFlowRectangleFlowNode>) {
  return (
    <div
      className={[
        'min-w-[9.375rem] max-w-[15.625rem] rounded border-2 border-[var(--border-color)] bg-[var(--bg-color-container)] transition-all duration-200',
        selected ? 'border-[var(--brand-color-6)] ring-2 ring-[var(--brand-color-focus)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-3 py-2 text-sm font-bold text-[var(--text-color-primary)]">
        {data.label}
      </div>
      <div className="px-3 py-2 text-xs text-[var(--text-color-secondary)]">
        {data.description || '无描述'}
      </div>
    </div>
  )
}

export default RectangleNode
