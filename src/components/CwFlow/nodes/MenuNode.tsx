import type { CwFlowMenuNodeData, CwFlowNodeRendererProps } from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 菜单节点 */
export function CwFlowMenuNode({ node, selected, disabled }: CwFlowNodeRendererProps) {
  const data = node.data as unknown as CwFlowMenuNodeData
  return (
    <div
      className={[
        'min-w-[9.375rem] overflow-hidden rounded border-2 border-[var(--border-color)] bg-[var(--bg-color-container)] transition-all duration-200',
        selected ? 'border-[var(--brand-color-6)] ring-2 ring-[var(--brand-color-focus)]' : '',
        disabled ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-3 py-2 text-sm font-bold text-[var(--text-color-primary)]">
        {data.label}
      </div>
      <div className="max-h-[12.5rem] overflow-y-auto">
        {data.menuItems.map((item) => (
          <div
            key={item.value}
            className="cursor-pointer hairline-border-b border-[var(--border-color)] px-3 py-2 text-xs text-[var(--text-color-primary)] transition-colors last:hairline-border-b-0 hover:bg-[var(--bg-color-secondarycomponent-hover)]"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CwFlowMenuNode
