import type { Meta, StoryObj } from '@storybook/react'
import { CwCard } from './CwCard'

const meta: Meta<typeof CwCard> = {
  title: '1. Components/Display/CwCard',
  component: CwCard,
  args: {
    collapsible: false,
    defaultExpanded: true,
    showHeaderDivider: true,
  },
}

export default meta
type Story = StoryObj<typeof CwCard>

export const Default: Story = {
  args: {
    headerLeftSlot: <span>2025-10-25 10:00</span>,
    headerRightSlot: <span>待确认</span>,
    children: <div>卡片正文区域示例</div>,
  },
}

export const Collapsible: Story = {
  args: {
    collapsible: true,
    headerLeftSlot: <span>可折叠标题</span>,
    headerRightSlot: <span>点击整行折叠</span>,
    children: <div>点击 header 可收起/展开此区域。</div>,
  },
}
