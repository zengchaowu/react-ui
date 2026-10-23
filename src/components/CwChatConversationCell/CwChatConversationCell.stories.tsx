import type { Meta, StoryObj } from '@storybook/react'
import { CwChatConversationCell } from './CwChatConversationCell'

const meta: Meta<typeof CwChatConversationCell> = {
  title: '1. Components/Chat/CwChatConversationCell',
  component: CwChatConversationCell,
}

export default meta
type Story = StoryObj<typeof CwChatConversationCell>

export const Default: Story = {
  args: {
    name: '产品讨论组',
    avatarFallbackSrc: '',
    description: '今天下午三点开会',
    time: '12:30',
    unreadCount: 3,
  },
}
