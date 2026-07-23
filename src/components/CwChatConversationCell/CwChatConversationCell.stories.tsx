import type { Meta, StoryObj } from '@storybook/react'
import { CwChatConversationCell } from './CwChatConversationCell'

const meta: Meta<typeof CwChatConversationCell> = {
  title: 'Cw/CwChatConversationCell',
  component: CwChatConversationCell,
}

export default meta
type Story = StoryObj<typeof CwChatConversationCell>

export const Default: Story = {
  args: {
    children: 'CwChatConversationCell',
  },
}
