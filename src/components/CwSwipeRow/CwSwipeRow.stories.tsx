import type { Meta, StoryObj } from '@storybook/react'
import { CwSwipeRow } from './CwSwipeRow'

const meta: Meta<typeof CwSwipeRow> = {
  title: 'Cw/CwSwipeRow',
  component: CwSwipeRow,
}

export default meta
type Story = StoryObj<typeof CwSwipeRow>

export const Default: Story = {
  args: {
    children: 'CwSwipeRow',
  },
}
