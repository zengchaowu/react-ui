import type { Meta, StoryObj } from '@storybook/react'
import { CwBreadcrumb } from './CwBreadcrumb'

const meta: Meta<typeof CwBreadcrumb> = {
  title: '1. Components/Navigation/CwBreadcrumb',
  component: CwBreadcrumb,
}

export default meta
type Story = StoryObj<typeof CwBreadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: '首页', to: '/' },
      { label: '产品', to: '/products' },
      { label: '当前页' },
    ],
  },
}

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: '首页', to: '/' },
      { label: '设置', to: '/settings' },
      { label: '账户' },
    ],
    separator: '›',
  },
}

export const InlineCompact: Story = {
  args: {
    appearance: 'inline-compact',
    items: [
      { label: '云盘', to: '/' },
      { label: '文档', to: '/docs' },
      { label: '当前' },
    ],
  },
}
