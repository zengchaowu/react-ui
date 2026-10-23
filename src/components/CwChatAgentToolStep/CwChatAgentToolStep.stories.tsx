import type { Meta, StoryObj } from '@storybook/react'
import { CwChatAgentToolStep } from './CwChatAgentToolStep'

const meta: Meta<typeof CwChatAgentToolStep> = {
  title: '1. Components/Chat/CwChatAgentToolStep',
  component: CwChatAgentToolStep,
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolStep>

export const Default: Story = {
  args: {
    step: {
      id: 'step-1',
      name: 'read_file',
      status: 'done',
      argsPreview: '{"path":"src/index.ts"}',
    },
  },
}

export const Terminal: Story = {
  args: {
    step: {
      id: 'step-terminal',
      name: 'exec_command',
      status: 'done',
      argsPreview: '{"command":"npm run test"}',
      resultPreview:
        '{"command":"npm run test","stdout":"PASS src/index.test.ts","stderr":"","exit_code":0}',
    },
  },
}
