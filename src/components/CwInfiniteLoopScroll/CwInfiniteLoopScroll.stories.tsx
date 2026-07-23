import type { Meta, StoryObj } from '@storybook/react'
import { CwInfiniteLoopScroll } from './CwInfiniteLoopScroll'

const meta: Meta<typeof CwInfiniteLoopScroll> = {
  title: 'Cw/CwInfiniteLoopScroll',
  component: CwInfiniteLoopScroll,
}

export default meta
type Story = StoryObj<typeof CwInfiniteLoopScroll>

export const Default: Story = {
  args: {
    children: 'CwInfiniteLoopScroll',
  },
}
