import type { Meta, StoryObj } from '@storybook/react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import type { ImFileChangeRecord } from '@zengchaowu/shared/functions/im/imFileChanges'
import { CwChatFileChangeBlock } from './CwChatFileChangeBlock'

const editPath =
  'packages/react-ui/src/components/CwChatAgentToolStep/CwChatAgentToolStep.tsx'

const editedStep: AgentToolStep = {
  id: 'call_edit',
  name: 'file_system',
  status: 'done',
  argsPreview: JSON.stringify({ operation: 'replace', path: editPath }),
  startedAt: '2026-06-02T10:00:00.000Z',
  endedAt: '2026-06-02T10:00:01.200Z',
}

const editedReview: ImFileChangeRecord = {
  id: 'fc_edit',
  path: editPath,
  rootAbs: 'C:/workspace',
  before: 'export const collapsed = false\n',
  after: "export const collapsed = true\nexport const kind = 'shell'\n",
  op: 'replace',
  toolCallId: 'call_edit',
  createdAt: Date.parse('2026-06-02T10:00:01.200Z'),
}

const meta: Meta<typeof CwChatFileChangeBlock> = {
  title: '1. Components/Chat/CwChatFileChangeBlock',
  component: CwChatFileChangeBlock,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[22.5rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    step: editedStep,
    review: editedReview,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Edited: Story = {}

export const Created: Story = {
  args: {
    step: {
      id: 'call_create',
      name: 'file_system',
      status: 'done',
      argsPreview: JSON.stringify({
        operation: 'write',
        path: 'packages/react-ui/src/components/CwChatFileChangeBlock/CwChatFileChangeBlock.stories.tsx',
        isCreate: true,
      }),
      startedAt: '2026-06-02T10:01:00.000Z',
      endedAt: '2026-06-02T10:01:00.400Z',
    } satisfies AgentToolStep,
    review: {
      id: 'fc_create',
      path: 'packages/react-ui/src/components/CwChatFileChangeBlock/CwChatFileChangeBlock.stories.tsx',
      rootAbs: 'C:/workspace',
      before: '',
      after: "import type { Meta } from '@storybook/react'\nexport default {}\n",
      op: 'create',
      isCreate: true,
      toolCallId: 'call_create',
      createdAt: Date.parse('2026-06-02T10:01:00.400Z'),
    } satisfies ImFileChangeRecord,
  },
}

export const Running: Story = {
  args: {
    step: {
      id: 'call_edit_run',
      name: 'file_system',
      status: 'running',
      argsPreview: JSON.stringify({ operation: 'replace', path: editPath }),
      startedAt: '2026-06-02T10:02:00.000Z',
    } satisfies AgentToolStep,
    review: null,
  },
}
