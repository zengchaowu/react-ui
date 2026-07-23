import type { Meta, StoryObj } from '@storybook/react'
import { CwInfiniteScroll } from './CwInfiniteScroll'

const meta: Meta<typeof CwInfiniteScroll> = {
  title: 'Cw/CwInfiniteScroll',
  component: CwInfiniteScroll,
}

export default meta
type Story = StoryObj<typeof CwInfiniteScroll>

export const Default: Story = {
  args: {
    children: 'CwInfiniteScroll',
  },
}
