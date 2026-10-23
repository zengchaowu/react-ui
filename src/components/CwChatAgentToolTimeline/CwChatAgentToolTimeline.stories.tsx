import type { Meta, StoryObj } from '@storybook/react'
import { CwChatAgentToolTimeline } from './CwChatAgentToolTimeline'

const meta: Meta<typeof CwChatAgentToolTimeline> = {
  title: '1. Components/Chat/CwChatAgentToolTimeline',
  component: CwChatAgentToolTimeline,
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolTimeline>

export const Default: Story = {
  args: {
    steps: [
      {
        id: 'step-1',
        name: 'read_file',
        status: 'done',
        argsPreview: '{"path":"src/index.ts"}',
      },
      {
        id: 'step-2',
        name: 'grep_search',
        status: 'running',
        argsPreview: '{"pattern":"useEffect"}',
      },
    ],
  },
}
