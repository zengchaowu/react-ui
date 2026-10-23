import type { Meta, StoryObj } from '@storybook/react'
import { CwProgress } from './CwProgress'

const meta: Meta<typeof CwProgress> = {
  title: '1. Components/Display/CwProgress',
  component: CwProgress,
}

export default meta
type Story = StoryObj<typeof CwProgress>

export const Default: Story = {
  args: {
    value: 40,
    direction: 'vertical',
  },
}
