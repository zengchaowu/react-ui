import type { Meta, StoryObj } from '@storybook/react'
import { CwTooltip } from './CwTooltip'

const meta: Meta<typeof CwTooltip> = {
  title: '1. Components/Overlay/CwTooltip',
  component: CwTooltip,
}

export default meta
type Story = StoryObj<typeof CwTooltip>

export const Default: Story = {
  args: {
    content: '在丰富的信息密度场景中使用 Tooltip 提醒用户关注细节。',
    triggerSlot: (
      <span className="px-3 py-1 rounded-md bg-[var(--brand-color-6)] text-[var(--text-color-anti)] cursor-pointer select-none">
        悬停查看提示
      </span>
    ),
  },
}

export const ManualControl: Story = {
  args: {
    trigger: 'manual',
    value: true,
    content: '通过 value 手动控制 tooltip 的显示和隐藏。',
    triggerSlot: (
      <span className="px-3 py-1 rounded-md bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)] cursor-pointer select-none">
        点击或外部按钮控制
      </span>
    ),
  },
}
