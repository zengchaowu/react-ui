import type { Meta, StoryObj } from '@storybook/react'
import { numberControlArgType, type NumberOnlyProps } from '../../storybook/argTypes'
import { CwButtonGroup } from './CwButtonGroup'
import type { CwButtonGroupButton, CwButtonGroupProps } from './types'

type CwButtonGroupStoryArgs = NumberOnlyProps<CwButtonGroupProps, 'gap'>

const buttons: CwButtonGroupButton[] = [
  { id: 1, label: '按钮1', variant: 'default', onClick: () => console.log('按钮1点击') },
  { id: 2, label: '按钮2', variant: 'default', onClick: () => console.log('按钮2点击') },
  { id: 3, label: '主要操作', variant: 'brandOutline', onClick: () => console.log('按钮3点击') },
]

const meta = {
  title: '1. Components/Action/CwButtonGroup',
  component: CwButtonGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '按钮组组件，使用 CwButton 渲染，支持预设 variant，默认从右往左渲染。',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    gap: 8,
  },
  argTypes: {
    buttons: {
      control: 'object',
      description: '按钮数组',
    },
    reverse: {
      control: 'boolean',
      description: '是否从右往左渲染（默认 true）',
    },
    gap: numberControlArgType({
      min: 0,
      step: 1,
      description: '按钮间距：number 为 px（默认 8）；string 可为 CSS 长度',
    }),
    equalWidth: {
      control: 'boolean',
      description: '按钮等宽',
    },
    fillRemainingSpace: {
      control: 'boolean',
      description: '按钮组填充剩余空间，每个按钮按内容宽度分配',
    },
  },
} satisfies Meta<CwButtonGroupStoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    buttons,
    reverse: true,
  },
  render: (args) => (
    <div className="min-h-[100vh] bg-[var(--bg-color-container)] p-4">
      <CwButtonGroup {...args} />
    </div>
  ),
}

export const WithVariants: Story = {
  args: {
    buttons: [
      { id: 'record', label: '写记录', variant: 'secondary', onClick: () => {} },
      { id: 'wechat', label: '微信', variant: 'brand', onClick: () => {} },
      { id: 'phone', label: '电话', variant: 'brand', onClick: () => {} },
      { id: 'detail', label: '详情', variant: 'brand', onClick: () => {} },
    ],
    reverse: true,
    gap: 8,
    equalWidth: true,
  },
  render: (args) => (
    <div className="min-h-[100vh] bg-[var(--bg-color-container)] p-4">
      <CwButtonGroup {...args} />
    </div>
  ),
}

export const FillRemainingSpace: Story = {
  args: {
    buttons: [
      { id: 1, label: '短', variant: 'secondary', onClick: () => {} },
      { id: 2, label: '中等长度', variant: 'brand', onClick: () => {} },
      { id: 3, label: '较长的按钮文案', variant: 'brand', onClick: () => {} },
    ],
    reverse: true,
    fillRemainingSpace: true,
  },
  render: (args) => (
    <div className="flex w-full bg-[var(--bg-color-container)] p-4">
      <CwButtonGroup {...args} />
    </div>
  ),
}

export const EqualWidth: Story = {
  args: {
    buttons: [
      { id: 1, label: '取消', variant: 'secondary', onClick: () => {} },
      { id: 2, label: '确认', variant: 'brand', onClick: () => {} },
    ],
    reverse: true,
    equalWidth: true,
  },
  render: (args) => (
    <div className="bg-[var(--bg-color-container)] p-4">
      <CwButtonGroup {...args} />
    </div>
  ),
}
