import type { Meta, StoryObj } from '@storybook/react'
import { CwGraph } from './CwGraph'

const meta: Meta<typeof CwGraph> = {
  title: 'Cw/CwGraph',
  component: CwGraph,
}

export default meta
type Story = StoryObj<typeof CwGraph>

export const Default: Story = {
  args: {
    children: 'CwGraph',
  },
}
