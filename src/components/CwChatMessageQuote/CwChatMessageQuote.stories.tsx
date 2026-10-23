import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageQuote } from './CwChatMessageQuote'

const meta: Meta<typeof CwChatMessageQuote> = {
  title: '1. Components/Chat/CwChatMessageQuote',
  component: CwChatMessageQuote,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '聊天消息引用条，可用于输入框上方或气泡内跳转引用。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const preview = {
  messageId: 'msg-1',
  senderName: '张三',
  snippet: '你好，这是一条引用消息',
  missing: false,
}

export const ComposerBar: Story = {
  args: {
    preview,
    dismissible: true,
  },
}

export const InBubble: Story = {
  args: {
    preview,
    navigable: true,
  },
}
