import type { Meta, StoryObj } from '@storybook/react'
import { CwButtonGroup } from './CwButtonGroup'
import type { CwButtonGroupButton } from './types'

const buttons: CwButtonGroupButton[] = [
  { id: 1, label: '按钮1', variant: 'default', onClick: () => {} },
  { id: 2, label: '按钮2', variant: 'default', onClick: () => {} },
  { id: 3, label: '主要操作', variant: 'brandOutline', onClick: () => {} },
]

const meta: Meta<typeof CwButtonGroup> = {
  title: '1. Components/Action/CwButtonGroup',
  component: CwButtonGroup,
  args: {
    buttons,
    reverse: true,
    gap: 8,
  },
}

export default meta
type Story = StoryObj<typeof CwButtonGroup>

export const Default: Story = {}

export const WithVariants: Story = {
  args: {
    buttons: [
      { id: 'record', label: '写记录', variant: 'secondary', onClick: () => {} },
      { id: 'wechat', label: '微信', variant: 'brand', onClick: () => {} },
      { id: 'phone', label: '电话', variant: 'brand', onClick: () => {} },
      { id: 'detail', label: '详情', variant: 'brand', onClick: () => {} },
    ],
    equalWidth: true,
  },
}

export const FillRemainingSpace: Story = {
  args: {
    buttons: [
      { id: 1, label: '短', variant: 'secondary', onClick: () => {} },
      { id: 2, label: '中等长度', variant: 'brand', onClick: () => {} },
      { id: 3, label: '较长的按钮文案', variant: 'brand', onClick: () => {} },
    ],
    fillRemainingSpace: true,
  },
}
