/** Storybook：WithSlots 分块标题样式（每个插槽单独一个组件实例） */
export const slotStorySectionLabelClass =
  'mb-2 text-xs font-medium text-[var(--text-color-secondary)]'

export function slotStorySectionLabel(slotName: string): string {
  return slotName === 'default' ? '#default（默认插槽）' : `#${slotName}`
}

export const withSlotsStoryParameters = {
  docs: {
    description: {
      story:
        '每个插槽单独一块区域、单独挂载一个组件实例，仅填充当前插槽，便于对照 API 与布局。',
    },
  },
} as const
