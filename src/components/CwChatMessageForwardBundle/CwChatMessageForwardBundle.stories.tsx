import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageForwardBundle } from './CwChatMessageForwardBundle'

const meta: Meta<typeof CwChatMessageForwardBundle> = {
  title: 'Cw/CwChatMessageForwardBundle',
  component: CwChatMessageForwardBundle,
}

export default meta
type Story = StoryObj<typeof CwChatMessageForwardBundle>

export const Default: Story = {
  args: {
    children: 'CwChatMessageForwardBundle',
  },
}
