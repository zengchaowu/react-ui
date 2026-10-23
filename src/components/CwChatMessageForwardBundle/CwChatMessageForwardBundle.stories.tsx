import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageForwardBundle } from './CwChatMessageForwardBundle'
import { defaultCwChatMessageForwardBundleTexts } from './texts'

const meta: Meta<typeof CwChatMessageForwardBundle> = {
  title: '1. Components/Chat/CwChatMessageForwardBundle',
  component: CwChatMessageForwardBundle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CwChatMessageForwardBundle>

const items = [
  { senderName: 'Alice', snippet: '下午开会吗？', content: '下午开会吗？' },
  { senderName: 'Bob', snippet: '可以，三点。', content: '可以，三点。' },
  { senderName: 'Alice', snippet: '好的', content: '好的' },
]

export const Default: Story = {
  args: {
    chatMessageId: 'fwd-1',
    items,
    texts: defaultCwChatMessageForwardBundleTexts,
  },
}
