import type { Meta, StoryObj } from '@storybook/react'
import { CwResizeFrame } from './CwResizeFrame'

const meta: Meta<typeof CwResizeFrame> = {
  title: 'Cw/CwResizeFrame',
  component: CwResizeFrame,
}

export default meta
type Story = StoryObj<typeof CwResizeFrame>

export const Default: Story = {
  args: {
    children: 'CwResizeFrame',
  },
}
