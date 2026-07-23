import type { Meta, StoryObj } from '@storybook/react'
import { CwChatAgentToolTimeline } from './CwChatAgentToolTimeline'

const meta: Meta<typeof CwChatAgentToolTimeline> = {
  title: 'Cw/CwChatAgentToolTimeline',
  component: CwChatAgentToolTimeline,
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolTimeline>

export const Default: Story = {
  args: {
    children: 'CwChatAgentToolTimeline',
  },
}
