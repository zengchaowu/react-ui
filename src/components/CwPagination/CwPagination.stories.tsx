import type { Meta, StoryObj } from '@storybook/react'
import { CwPagination } from './CwPagination'

const meta: Meta<typeof CwPagination> = {
  title: 'Cw/CwPagination',
  component: CwPagination,
}

export default meta
type Story = StoryObj<typeof CwPagination>

export const Default: Story = {
  args: {
    children: 'CwPagination',
  },
}
