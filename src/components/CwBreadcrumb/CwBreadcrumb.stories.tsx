import type { Meta, StoryObj } from '@storybook/react'
import { CwBreadcrumb } from './CwBreadcrumb'

const meta: Meta<typeof CwBreadcrumb> = {
  title: '1. Components/Navigation/CwBreadcrumb',
  component: CwBreadcrumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '面包屑导航组件，用于展示当前页在层级结构中的位置，支持链接与自定义分隔符。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: '面包屑项列表',
    },
    separator: {
      control: { type: 'text' },
      description: '分隔符',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'inline-compact'],
      description: '官方外观',
    },
  },
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

export const WithExternalLink: Story = {
  args: {
    items: [
      { label: '首页', to: '/' },
      { label: '帮助文档', href: 'https://example.com/docs' },
      { label: 'API 说明' },
    ],
  },
}

export const LongPath: Story = {
  args: {
    items: [
      { label: '首页', to: '/' },
      { label: '项目', to: '/projects' },
      { label: '项目 A', to: '/projects/a' },
      { label: '迭代 1', to: '/projects/a/iterations/1' },
      { label: '任务详情' },
    ],
  },
}

export const AppearanceInlineCompact: Story = {
  args: {
    appearance: 'inline-compact',
    items: [
      { label: '云盘', to: '/' },
      { label: '文档', to: '/docs' },
      { label: '当前' },
    ],
  },
  render: (args) => (
    <div className="flex h-8 w-[28rem] items-center rounded border border-[var(--border-color)] px-2">
      <CwBreadcrumb {...args} className="min-w-0 flex-1 h-full" />
    </div>
  ),
}
