import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageList } from './CwChatMessageList'

const meta: Meta<typeof CwChatMessageList> = {
  title: 'Cw/CwChatMessageList',
  component: CwChatMessageList,
}

export default meta
type Story = StoryObj<typeof CwChatMessageList>

export const Default: Story = {
  args: {
    children: 'CwChatMessageList',
  },
}
