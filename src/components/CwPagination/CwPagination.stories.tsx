import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwPagination } from './CwPagination'

const meta: Meta<typeof CwPagination> = {
  title: '1. Components/Navigation/CwPagination',
  component: CwPagination,
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
  },
  render: (args) => <ControlledPagination {...args} />,
}

export const FullFeatures: Story = {
  args: {
    value: 10,
    total: 1000,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  },
  render: (args) => <ControlledPagination {...args} />,
}
