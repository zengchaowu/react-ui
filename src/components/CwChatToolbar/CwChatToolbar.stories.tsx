import type { Meta, StoryObj } from '@storybook/react'
import { CwChatToolbar } from './CwChatToolbar'

const meta: Meta<typeof CwChatToolbar> = {
  title: '1. Components/Chat/CwChatToolbar',
  component: CwChatToolbar,
}

export default meta
type Story = StoryObj<typeof CwChatToolbar>

export const Default: Story = {
  args: {
    items: [
      { key: 'emoji', label: '表情', icon: 'chat--msg--emoji-line' },
      { key: 'file', label: '文件', icon: 'common--nav--file-line' },
      { key: 'image', label: '图片', icon: 'common--media--image-line' },
    ],
  },
}
