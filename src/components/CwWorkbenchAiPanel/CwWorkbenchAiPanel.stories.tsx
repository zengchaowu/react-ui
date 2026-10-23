import type { Meta, StoryObj } from '@storybook/react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { CwWorkbenchAiPanel } from './CwWorkbenchAiPanel'

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'text',
    content: '帮我整理选中内容的命名',
    timestamp: new Date(),
    sender: { id: 'u', name: '我' },
    isOwn: true,
    status: 'sent',
  },
  {
    id: '2',
    type: 'markdown',
    content: '可以先统一前缀，再按功能分段命名。',
    timestamp: new Date(),
    sender: {
      id: 'a',
      name: 'AI 助手',
    },
    isOwn: false,
    status: 'sent',
  },
]

const meta: Meta<typeof CwWorkbenchAiPanel> = {
  title: '1. Components/Chat/CwWorkbenchAiPanel',
  component: CwWorkbenchAiPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Workbench assistant sidebar shell: header actions, optional banner/status slots, message list, workspace composer.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' } },
    subtitle: { control: { type: 'text' } },
    ready: { control: { type: 'boolean' }, description: '输入区是否可用' },
    busy: { control: { type: 'boolean' }, description: 'AI 回复进行中（显示停止）' },
    errorMessage: { control: { type: 'text' }, description: '顶部错误提示' },
    hasSelectionContext: { control: { type: 'boolean' }, description: '是否有选中上下文' },
    avatarFallbackSrc: { control: false },
    messages: { control: false },
    texts: { control: false },
  },
  args: {
    title: '工作台助手',
    subtitle: 'Demo Agent',
    ready: true,
    busy: false,
    errorMessage: '',
    hasSelectionContext: false,
  },
}

export default meta
type Story = StoryObj<typeof CwWorkbenchAiPanel>

export const Default: Story = {
  render: (args) => (
    <div className="h-[32rem] w-[22rem] border border-[var(--border-color)] bg-[var(--bg-color-container)]">
      <CwWorkbenchAiPanel
        {...args}
        messages={sampleMessages}
        avatarFallbackSrc=""
        bannerSlot={
          <p className="m-0 shrink-0 hairline-border-b border-[var(--border-color)] px-3 py-1.5 text-xs text-[var(--text-color-secondary)]">
            可在此放置上下文说明
          </p>
        }
      />
    </div>
  ),
}
