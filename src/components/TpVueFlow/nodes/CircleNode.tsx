import type { Node, NodeProps } from '@xyflow/react'

export type TpVueFlowCircleNodeData = {
  label: string
  color?: string
}

export type TpVueFlowCircleFlowNode = Node<TpVueFlowCircleNodeData, 'circle'>

export function CircleNode({ data, selected }: NodeProps<TpVueFlowCircleFlowNode>) {
  return (
    <div
      className={[
        'flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] transition-all duration-200',
        selected ? 'border-[var(--brand-color-6)] ring-2 ring-[var(--brand-color-focus)]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="break-words px-1 text-center text-xs text-[var(--text-color-primary)]">
        {data.label}
      </div>
    </div>
  )
}

export default CircleNode
