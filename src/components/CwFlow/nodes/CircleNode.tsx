import type { CwFlowCircleNodeData, CwFlowNodeRendererProps } from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 圆形节点 */
export function CwFlowCircleNode({ node, selected, disabled }: CwFlowNodeRendererProps) {
  const data = node.data as unknown as CwFlowCircleNodeData
  return (
    <div
      className={[
        'flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] transition-all duration-200',
        selected ? 'border-[var(--brand-color-6)] ring-2 ring-[var(--brand-color-focus)]' : '',
        disabled ? 'opacity-60' : '',
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

export default CwFlowCircleNode
