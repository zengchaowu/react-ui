import type { Meta, StoryObj } from '@storybook/react'
import { CwVirtualScroll } from './CwVirtualScroll'

const meta: Meta<typeof CwVirtualScroll> = {
  title: 'Cw/CwVirtualScroll',
  component: CwVirtualScroll,
}

export default meta
type Story = StoryObj<typeof CwVirtualScroll>

export const Default: Story = {
  args: {
    children: 'CwVirtualScroll',
  },
}
