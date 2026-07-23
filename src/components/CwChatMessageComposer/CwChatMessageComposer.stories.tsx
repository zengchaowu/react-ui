import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageComposer } from './CwChatMessageComposer'

const meta: Meta<typeof CwChatMessageComposer> = {
  title: 'Cw/CwChatMessageComposer',
  component: CwChatMessageComposer,
}

export default meta
type Story = StoryObj<typeof CwChatMessageComposer>

export const Default: Story = {
  args: {
    children: 'CwChatMessageComposer',
  },
}
