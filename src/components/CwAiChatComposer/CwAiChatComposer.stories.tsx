import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { storyAlert } from '../../storybook/storyAlert'
import { CwAiChatComposer } from './CwAiChatComposer'

const meta: Meta<typeof CwAiChatComposer> = {
  title: '1. Components/Chat/CwAiChatComposer',
  component: CwAiChatComposer,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component:
          'AI 会话输入框：TipTap 多行编辑、语音按住说话、附件与发送/停止。`wide` 为桌面卡片（左工具/右发送常显）；`narrow` 为 IM 条。内部子区域为 absolute 布局，宿主或 Story 须提供明确宽度。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[32.5rem] max-w-full border border-[var(--border-color)] bg-[var(--bg-color-page)] p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    layout: {
      control: { type: 'select' },
      options: ['wide', 'narrow'],
    },
    disabled: { control: { type: 'boolean' } },
    sending: { control: { type: 'boolean' } },
    showAttach: { control: { type: 'boolean' } },
    showVoice: { control: { type: 'boolean' } },
    voiceIcon: { control: { type: 'text' } },
    minRows: { control: { type: 'number', min: 1, step: 1 } },
    maxRows: { control: { type: 'number', min: 1, step: 1 } },
    pendingAttachmentCount: { control: { type: 'number', min: 0, step: 1 } },
    texts: { control: false },
  },
  args: {
    layout: 'wide',
    disabled: false,
    sending: false,
    showAttach: true,
    showVoice: true,
    pendingAttachmentCount: 0,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ComposerDemo({
  args,
  initialDraft = '',
}: {
  args: Story['args']
  initialDraft?: string
}) {
  const [draft, setDraft] = useState(initialDraft)
  return (
    <CwAiChatComposer
      {...args}
      value={draft}
      onChange={setDraft}
      onSubmit={() => storyAlert(draft)}
    />
  )
}

export const Default: Story = {
  name: 'Wide (desktop)',
  render: (args) => <ComposerDemo args={args} />,
}

export const NarrowLayout: Story = {
  args: {
    layout: 'narrow',
  },
  render: (args) => <ComposerDemo args={args} />,
}

export const WithDraft: Story = {
  render: (args) => (
    <ComposerDemo args={args} initialDraft="你好，请帮我总结一下今天的会议要点。" />
  ),
}
