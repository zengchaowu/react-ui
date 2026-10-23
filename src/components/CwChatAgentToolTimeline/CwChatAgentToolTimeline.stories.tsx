import type { Meta, StoryObj } from '@storybook/react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import { CwChatAgentToolTimeline } from './CwChatAgentToolTimeline'

const mockSteps: AgentToolStep[] = [
  {
    id: 'call_1',
    name: 'file_system',
    status: 'done',
    argsPreview: '{"path":"agentToolDisplayPolicy.ts","startLine":1,"endLine":123}',
    startedAt: '2026-06-02T10:00:00.000Z',
    endedAt: '2026-06-02T10:00:01.200Z',
  },
  {
    id: 'call_2',
    name: 'code_search',
    status: 'done',
    argsPreview: '{"query":"file_system|code_search","path":"packages"}',
    startedAt: '2026-06-02T10:00:01.500Z',
    endedAt: '2026-06-02T10:00:02.000Z',
  },
  {
    id: 'call_3',
    name: 'file_system',
    status: 'done',
    argsPreview: '{"path":"CwChatAgentToolTimeline.vue","startLine":1,"endLine":99}',
    startedAt: '2026-06-02T10:00:02.100Z',
    endedAt: '2026-06-02T10:00:02.400Z',
  },
]

const exploringSteps: AgentToolStep[] = [
  mockSteps[0],
  mockSteps[1],
  {
    ...mockSteps[2],
    status: 'running',
    endedAt: undefined,
  },
]

const meta: Meta<typeof CwChatAgentToolTimeline> = {
  title: '1. Components/Chat/CwChatAgentToolTimeline',
  component: CwChatAgentToolTimeline,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[22.5rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    steps: mockSteps,
    defaultExpanded: false,
  },
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolTimeline>

export const Default: Story = {}

export const Exploring: Story = {
  args: {
    defaultExpanded: false,
    steps: exploringSteps,
  },
}

export const Expanded: Story = {
  args: { defaultExpanded: true },
}

export const WithError: Story = {
  args: {
    steps: [
      {
        id: 'call_e',
        name: 'desktop_tool_invoke',
        status: 'error',
        argsPreview: '{"tool":"list_dir"}',
        error: '当前环境非桌面客户端或未注入 IPC',
        startedAt: '2026-06-02T10:00:00.000Z',
        endedAt: '2026-06-02T10:00:00.500Z',
      },
    ] satisfies AgentToolStep[],
  },
}
