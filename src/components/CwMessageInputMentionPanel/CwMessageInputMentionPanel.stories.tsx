import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { CwMessageInputMentionPanel } from './CwMessageInputMentionPanel'
import type { CwMessageInputMentionPanelProps } from './types'
import type { CwMessageInputMentionItem } from '@zengchaowu/ui-shared/components/CwMessageInput/types'

const sampleItems: CwMessageInputMentionItem[] = [
  { id: 'user_1', label: '张三' },
  { id: 'user_2', label: '李四' },
  { id: 'user_3', label: '王五' },
]

const meta: Meta<typeof CwMessageInputMentionPanel> = {
  title: '1. Components/Chat/CwMessageInputMentionPanel',
  component: CwMessageInputMentionPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '聊天输入中的 `@` 候选浮层，基于 CwPopup manual + VirtualElement。Story 中用固定坐标模拟光标锚点。',
      },
    },
  },
  argTypes: {
    value: { control: 'boolean', description: '是否显示浮层' },
    highlightIndex: { control: { type: 'number', min: 0, max: 10 }, description: '高亮项下标' },
  },
  args: {
    mentionAvatarFallbackSrc: chatDefaultAvatar,
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** 虚拟锚点固定在画布内，便于截图与调试定位 */
export const Default: Story = {
  name: '有候选',
  args: {
    value: true,
    items: sampleItems,
    highlightIndex: 0,
  },
  render: (args) => <MentionPanelDemo args={args} />,
}

function MentionPanelDemo({ args }: { args: Story['args'] }) {
  const [open, setOpen] = useState(args?.value ?? true)
  const [lastPick, setLastPick] = useState('')
  const anchor = { x: 160, y: 140 }

  useEffect(() => {
    if (args?.value != null) setOpen(args.value)
  }, [args?.value])

  const virtualReference = {
    getBoundingClientRect: () => new DOMRect(anchor.x, anchor.y, 0, 0),
  }

  return (
    <div className="relative min-h-[17.5rem] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-6">
      <p className="mb-4 text-xs text-[var(--text-color-secondary)]">
        橙色圆点表示虚拟锚点；列表应出现在锚点附近。
      </p>
      <div
        className="pointer-events-none absolute z-0 h-3 w-3 rounded-full border-2 border-[var(--text-color-anti)] bg-[var(--brand-color-6)] shadow"
        style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
      />
      <CwMessageInputMentionPanel
        value={open}
        virtualReference={virtualReference}
        items={args?.items}
        mentionAvatarFallbackSrc={args?.mentionAvatarFallbackSrc}
        highlightIndex={args?.highlightIndex}
        onChange={setOpen}
        onSelect={(item: CwMessageInputMentionItem) => {
          setLastPick(`${item.label} (${item.id})`)
        }}
      />
      {lastPick ? (
        <p className="mt-6 text-sm text-[var(--text-color-primary)]">上次选中：{lastPick}</p>
      ) : null}
    </div>
  )
}

export const EmptyNoMatch: Story = {
  name: '无匹配',
  args: {
    value: true,
    items: [],
    highlightIndex: 0,
  },
  render: (args) => <EmptyMentionDemo {...args} />,
}

type EmptyMentionDemoProps = Partial<
  Pick<
    CwMessageInputMentionPanelProps,
    'items' | 'highlightIndex' | 'mentionAvatarFallbackSrc'
  >
>

function EmptyMentionDemo({
  items = [],
  highlightIndex = 0,
  mentionAvatarFallbackSrc = chatDefaultAvatar,
}: EmptyMentionDemoProps) {
  const [open, setOpen] = useState(true)
  const virtualReference = {
    getBoundingClientRect: () => new DOMRect(180, 120, 0, 0),
  }
  return (
    <div className="relative min-h-[13.75rem] rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] p-6">
      <CwMessageInputMentionPanel
        value={open}
        virtualReference={virtualReference}
        items={items}
        mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
        highlightIndex={highlightIndex}
        onChange={setOpen}
      />
    </div>
  )
}

export const SecondHighlighted: Story = {
  name: '高亮第二项',
  args: {
    value: true,
    items: sampleItems,
    highlightIndex: 1,
  },
  render: (args) => <MentionPanelDemo args={args} />,
}
