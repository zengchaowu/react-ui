import type { Meta, StoryObj } from '@storybook/react'
import { CwSplit } from './CwSplit'

const meta: Meta<typeof CwSplit> = {
  title: 'Cw/CwSplit',
  component: CwSplit,
}

export default meta
type Story = StoryObj<typeof CwSplit>

export const Default: Story = {
  args: {
    children: 'CwSplit',
  },
}
