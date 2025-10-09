import type { Meta, StoryObj } from '@storybook/react'
import { AtPagination } from './index'

const meta: Meta<typeof AtPagination> = {
  title: 'At/AtPagination',
  component: AtPagination,
  args: {
    defaultCurrent: 1,
    total: 50,
    pageSize: 10,
  },
}

export default meta
export const Basic: StoryObj<typeof AtPagination> = {}