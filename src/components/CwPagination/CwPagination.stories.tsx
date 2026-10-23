import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwPagination } from './CwPagination'

const meta: Meta<typeof CwPagination> = {
  title: '1. Components/Navigation/CwPagination',
  component: CwPagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwPagination 提供完整的分页功能，支持页码导航、跳转、每页条数选择等功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 1 },
      description: '当前页码（从 1 开始）',
    },
    total: {
      control: { type: 'number', min: 0 },
      description: '总数据条数',
    },
    pageSize: {
      control: { type: 'number', min: 1 },
      description: '每页显示数量',
    },
    showJumper: {
      control: { type: 'boolean' },
      description: '是否显示跳转输入框',
    },
    showTotal: {
      control: { type: 'boolean' },
      description: '是否显示总数信息',
    },
    showPageSize: {
      control: { type: 'boolean' },
      description: '是否显示每页条数选择器',
    },
    pageSizeOptions: {
      control: false,
      description: '每页条数选项',
    },
    pageButtonCount: {
      control: { type: 'number', min: 1 },
      description: '页码按钮数量（不包括首尾和省略号）',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    texts: {
      control: false,
      description: '文本配置',
    },
    onChange: { action: 'change' },
    onPageSizeChange: { action: 'pageSizeChange' },
  },
  args: {
    total: 500,
    pageSize: 10,
    pageButtonCount: 5,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ControlledPagination(args: Partial<ComponentProps<typeof CwPagination>>) {
  const [page, setPage] = useState(args.value ?? 1)
  const [pageSize, setPageSize] = useState(args.pageSize ?? 10)

  return (
    <CwPagination
      {...args}
      total={args.total ?? 0}
      value={page}
      pageSize={pageSize}
      onChange={(nextPage) => setPage(nextPage)}
      onPageSizeChange={(nextSize) => {
        setPageSize(nextSize)
        setPage(1)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    value: 1,
    total: 100,
    pageSize: 10,
    showJumper: false,
    showTotal: false,
    showPageSize: false,
    pageButtonCount: 5,
    disabled: false,
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const WithJumper: Story = {
  args: {
    value: 5,
    total: 200,
    pageSize: 20,
    showJumper: true,
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const WithTotal: Story = {
  args: {
    value: 3,
    total: 150,
    pageSize: 10,
    showTotal: true,
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const WithPageSize: Story = {
  args: {
    value: 1,
    total: 500,
    pageSize: 20,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const FullFeatures: Story = {
  args: {
    value: 10,
    total: 1000,
    pageSize: 50,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100, 200],
    pageButtonCount: 7,
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const Disabled: Story = {
  args: {
    value: 5,
    total: 200,
    pageSize: 20,
    disabled: true,
    showTotal: true,
    showJumper: true,
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const LargeTotal: Story = {
  args: {
    value: 50,
    total: 10000,
    pageSize: 100,
    showTotal: true,
    showJumper: true,
    pageButtonCount: 5,
  },
  render: (args) => <ControlledPagination {...args} />,
}
