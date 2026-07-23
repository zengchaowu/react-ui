import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageQuote } from './CwChatMessageQuote'

const meta: Meta<typeof CwChatMessageQuote> = {
  title: 'Cw/CwChatMessageQuote',
  component: CwChatMessageQuote,
}

export default meta
type Story = StoryObj<typeof CwChatMessageQuote>

export const Default: Story = {
  args: {
    children: 'CwChatMessageQuote',
  },
}
