import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageAssistantActions } from './CwChatMessageAssistantActions'

const meta: Meta<typeof CwChatMessageAssistantActions> = {
  title: 'Cw/CwChatMessageAssistantActions',
  component: CwChatMessageAssistantActions,
}

export default meta
type Story = StoryObj<typeof CwChatMessageAssistantActions>

export const Default: Story = {
  args: {
    children: 'CwChatMessageAssistantActions',
  },
}
