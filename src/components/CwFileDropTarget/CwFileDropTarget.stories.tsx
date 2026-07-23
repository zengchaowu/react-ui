import type { Meta, StoryObj } from '@storybook/react'
import { CwFileDropTarget } from './CwFileDropTarget'

const meta: Meta<typeof CwFileDropTarget> = {
  title: 'Cw/CwFileDropTarget',
  component: CwFileDropTarget,
}

export default meta
type Story = StoryObj<typeof CwFileDropTarget>

export const Default: Story = {
  args: {
    children: 'CwFileDropTarget',
  },
}
