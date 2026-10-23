import type { Meta, StoryObj } from '@storybook/react'
import { CwSlot } from './CwSlot'

const meta: Meta<typeof CwSlot> = {
  title: '1. Components/Layout/CwSlot',
  component: CwSlot,
}

export default meta
type Story = StoryObj<typeof CwSlot>

export const Default: Story = {
  args: {},
}
