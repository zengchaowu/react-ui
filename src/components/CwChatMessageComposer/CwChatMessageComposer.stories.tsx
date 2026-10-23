import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageComposer } from './CwChatMessageComposer'

const meta: Meta<typeof CwChatMessageComposer> = {
  title: '1. Components/Chat/CwChatMessageComposer',
  component: CwChatMessageComposer,
}

export default meta
type Story = StoryObj<typeof CwChatMessageComposer>

export const Default: Story = {
  args: {},
}
