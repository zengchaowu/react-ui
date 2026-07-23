import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageCell } from './CwChatMessageCell'

const meta: Meta<typeof CwChatMessageCell> = {
  title: 'Cw/CwChatMessageCell',
  component: CwChatMessageCell,
}

export default meta
type Story = StoryObj<typeof CwChatMessageCell>

export const Default: Story = {
  args: {
    children: 'CwChatMessageCell',
  },
}
