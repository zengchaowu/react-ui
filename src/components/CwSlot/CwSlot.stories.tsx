import type { Meta, StoryObj } from '@storybook/react'
import { CwSlot } from './CwSlot'

const meta: Meta<typeof CwSlot> = {
  title: 'Cw/CwSlot',
  component: CwSlot,
}

export default meta
type Story = StoryObj<typeof CwSlot>

export const Default: Story = {
  args: {
    children: 'CwSlot',
  },
}
