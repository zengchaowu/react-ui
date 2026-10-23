import type { Meta, StoryObj } from '@storybook/react'
import { CwChatQueuedOutboundDock } from './CwChatQueuedOutboundDock'

const meta: Meta<typeof CwChatQueuedOutboundDock> = {
  title: '1. Components/Chat/CwChatQueuedOutboundDock',
  component: CwChatQueuedOutboundDock,
}

export default meta
type Story = StoryObj<typeof CwChatQueuedOutboundDock>

export const Default: Story = {
  args: {},
}
