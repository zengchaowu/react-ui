import type { Meta, StoryObj } from '@storybook/react'
import { CwProgress } from './CwProgress'

const meta: Meta<typeof CwProgress> = {
  title: 'Cw/CwProgress',
  component: CwProgress,
}

export default meta
type Story = StoryObj<typeof CwProgress>

export const Default: Story = {
  args: {
    children: 'CwProgress',
  },
}
