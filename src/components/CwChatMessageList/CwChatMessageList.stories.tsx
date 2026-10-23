import type { Meta, StoryObj } from '@storybook/react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { CwChatMessageList } from './CwChatMessageList'

const messages = [
  {
    id: 'story-1',
    type: 'text',
    content: '你好，今天下午开会吗？',
    isOwn: false,
    status: 'sent',
    timeLabel: '14:00',
    timestamp: new Date(0),
    sender: { id: 'story-user', name: 'Story User' },
  },
  {
    id: 'story-2',
    type: 'text',
    content: '可以，三点。',
    isOwn: true,
    status: 'sent',
    timeLabel: '14:01',
    timestamp: new Date(0),
    sender: { id: 'story-self', name: 'Story Self' },
  },
] as ChatMessage[]

const meta: Meta<typeof CwChatMessageList> = {
  title: '1. Components/Chat/CwChatMessageList',
  component: CwChatMessageList,
}

export default meta
type Story = StoryObj<typeof CwChatMessageList>

export const Default: Story = {
  args: {
    messages,
    peerAvatarFallbackSrc: '',
    downloadByUrl: () => {},
  },
}
