import type { Meta, StoryObj } from '@storybook/react'
import { CwConfigCard } from './CwConfigCard'

const meta: Meta<typeof CwConfigCard> = {
  title: '1. Components/Display/CwConfigCard',
  component: CwConfigCard,
}

export default meta
type Story = StoryObj<typeof CwConfigCard>

export const Default: Story = {
  args: {
    title: '基础配置',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { key: 'name', label: '名称', value: '示例配置' },
      { key: 'status', label: '状态', value: '已启用' },
    ],
  },
}
