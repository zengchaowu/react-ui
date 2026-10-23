import type { Meta, StoryObj } from '@storybook/react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import { CwChatAgentToolStep } from './CwChatAgentToolStep'

const execStep: AgentToolStep = {
  id: 'call_exec',
  name: 'exec_command',
  status: 'done',
  argsPreview:
    '{"command":"dir \\"packages/vue-ui/src/components/CwChatAgentToolStep\\"; dir \\"packages/vue-ui/src/components\\" | findstr /i \\"Agent Tool Chat\\"","description":"Dir list agent tool components"}',
  resultPreview:
    '{"command":"dir \\"packages/vue-ui/src/components/CwChatAgentToolStep\\"; dir \\"packages/vue-ui/src/components\\" | findstr /i \\"Agent Tool Chat\\"","stdout":"Mode                 LastWriteTime         Length Name\\n----                 -------------         ------ ----\\n-a----         2026/8/25     19:58           2487 chrome.ts\\n-a----         2026/8/25     20:05            812 CwAgentToolShimmerLabel.vue\\n","stderr":"","exit_code":0}',
  startedAt: '2026-06-02T10:00:00.000Z',
  endedAt: '2026-06-02T10:00:01.200Z',
}

const meta: Meta<typeof CwChatAgentToolStep> = {
  title: '1. Components/Chat/CwChatAgentToolStep',
  component: CwChatAgentToolStep,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[22.5rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    step: execStep,
    defaultExpanded: true,
  },
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolStep>

export const ExecCommand: Story = {}

export const Running: Story = {
  args: {
    step: {
      id: 'call_exec_run',
      name: 'exec_command',
      status: 'running',
      argsPreview:
        '{"command":"pnpm --filter @zengchaowu/vue-ui storybook","description":"Start vue-ui Storybook"}',
      startedAt: '2026-06-02T10:00:01.500Z',
    } satisfies AgentToolStep,
    defaultExpanded: true,
  },
}

export const Error: Story = {
  args: {
    step: {
      id: 'call_exec_err',
      name: 'exec_command',
      status: 'error',
      argsPreview: '{"command":"pnpm test","description":"Run unit tests"}',
      resultPreview:
        '{"command":"pnpm test","stdout":"","stderr":"ELIFECYCLE Test failed","exit_code":1}',
      error: 'ELIFECYCLE Test failed',
      startedAt: '2026-06-02T10:00:00.000Z',
      endedAt: '2026-06-02T10:00:00.500Z',
    } satisfies AgentToolStep,
    defaultExpanded: true,
  },
}

