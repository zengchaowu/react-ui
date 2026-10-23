import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { imMessageAllowsSocialActions } from '@zengchaowu/shared/functions/im/imMessageSocialActions'
import { IM_MESSAGE_VIEW_NARROW_LAYOUT_BREAKPOINT_PX } from '@zengchaowu/shared/functions/im/imMessageViewLayout'
import type { CwChatDownloadByUrlFn } from '../components/CwChatMessageCell/types'
import { showCwContextMenu } from '../components/CwContextMenu/showCwContextMenu'
import type { CwContextMenuItem } from '../components/CwContextMenu/types'
import {
  demoDefaultContextMenuItems,
  openContextMenuStoryDemo,
} from './contextMenuStoryDemo'

/** Story 消息列表滚动根 class */
export const storybookChatMessageListRootClass =
  'box-border min-h-0 flex-1 bg-[var(--chat-message-area-bg)]'

/** Story 消息列表内容区 class */
export const storybookChatMessageListContentClass = 'space-y-8 px-3 py-3'

export const storybookChatMessageListFrameClass =
  'flex h-[min(42rem,calc(100vh-2rem))] w-full max-w-[50rem] flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--chat-message-area-bg)] shadow-sm'

/** Story 默认不启用窄屏断点，避免演示容器宽度 < 768px 时头像列被隐藏 */
export const storybookChatMessageListNarrowBreakpointPx = null

/** 演示窄屏紧凑排版（隐藏头像列）时使用 */
export const storybookChatMessageListNarrowLayoutBreakpointPx =
  IM_MESSAGE_VIEW_NARROW_LAYOUT_BREAKPOINT_PX

export const storybookChatMessageListHintClass =
  'shrink-0 hairline-border-b border-[var(--border-color)] px-4 py-2 text-xs leading-relaxed text-[var(--text-color-secondary)]'

export const storybookChatDownloadByUrl: CwChatDownloadByUrlFn = (url, suggestedFileName) => {
  console.info('[Storybook] downloadByUrl', { url, suggestedFileName })
}

const senderA = { id: 'u-a', name: '成员甲' }
const senderB = { id: 'u-b', name: '成员乙' }
const senderMe = { id: 'me', name: '我' }

export const storybookChatMessageListSampleMessages: ChatMessage[] = [
  {
    id: 'm1',
    timestamp: new Date(),
    sender: senderA,
    type: 'text',
    content:
      '你好，这是会话里的对方消息。可以在气泡内拖选文字；在空白处按住拖动可框选进入多选。',
    isOwn: false,
    timeLabel: '09:12',
  },
  {
    id: 'm2',
    timestamp: new Date(),
    sender: senderMe,
    type: 'text',
    content: '收到。我这边是己方气泡，右键同样可以打开菜单。',
    isOwn: true,
    timeLabel: '09:13',
  },
  {
    id: 'm3',
    timestamp: new Date(),
    sender: senderB,
    type: 'text',
    content: '多人会话里会显示左侧头像与昵称。',
    isOwn: false,
    timeLabel: '09:14',
  },
  {
    id: 'm4',
    timestamp: new Date(),
    sender: senderMe,
    type: 'text',
    content: '再补一条较长的己方消息，方便观察左右边距与气泡最大宽度。',
    isOwn: true,
    timeLabel: '09:15',
  },
]

export function resolveStorybookChatMessageFromContextMenuEvent(
  messages: readonly ChatMessage[],
  event: MouseEvent,
): ChatMessage | null {
  const target = event.target
  if (!(target instanceof HTMLElement)) return null
  const bubble = target.closest('[data-cw-chat-message-bubble-body]')
  if (!(bubble instanceof HTMLElement)) return null
  const messageId = bubble.getAttribute('data-chat-message-id')?.trim()
  if (!messageId) return null
  return messages.find((m) => String(m.id) === messageId) ?? null
}

export function openStorybookChatMessageContextMenu(options: {
  messages: readonly ChatMessage[]
  event: MouseEvent
  items?: CwContextMenuItem[]
  onSelect?: (key: string, message: ChatMessage) => void
}) {
  const message = resolveStorybookChatMessageFromContextMenuEvent(
    options.messages,
    options.event,
  )
  if (!message) return false
  options.event.preventDefault()
  openContextMenuStoryDemo({
    event: options.event,
    items: options.items ?? demoDefaultContextMenuItems,
    appearance: 'compact',
    onSelect: (key) => options.onSelect?.(key, message),
  })
  return true
}

/** 多选模式下空白处右键：演示批量菜单 */
export function openStorybookChatMessageBatchContextMenu(options: {
  event: MouseEvent
  selectedCount: number
  onSelect?: (key: string) => void
}) {
  if (options.selectedCount <= 0) return false
  options.event.preventDefault()
  showCwContextMenu({
    x: options.event.clientX,
    y: options.event.clientY,
    appearance: 'compact',
    items: [
      { key: 'forward', label: '合并转发' },
      { key: 'delete', label: `删除 ${options.selectedCount} 条`, danger: true },
    ],
    onSelect: options.onSelect,
  })
  return true
}

export const storybookChatMessageSelectable = imMessageAllowsSocialActions

const storybookLoadOlderSenders = [senderA, senderB, senderMe] as const

/** 生成一页演示消息（pageIndex 越小表示越早） */
export function createStorybookChatMessageListPage(
  pageIndex: number,
  pageSize = 8,
): ChatMessage[] {
  return Array.from({ length: pageSize }, (_, i) => {
    const isOwn = i % 3 === 1
    const sender = isOwn ? storybookLoadOlderSenders[2] : storybookLoadOlderSenders[i % 2]!
    return {
      id: `story-older-p${pageIndex}-m${i}`,
      timestamp: new Date(Date.now() - (pageIndex * pageSize + i) * 60_000),
      sender,
      type: 'text',
      content: `[历史第 ${pageIndex + 1} 页 · ${i + 1}/${pageSize}] 滚到列表顶部附近会继续加载更早消息；prepend 后应尽量保持当前阅读位置不变。`,
      isOwn,
      timeLabel: `${String(8 + pageIndex).padStart(2, '0')}:${String(i).padStart(2, '0')}`,
    }
  })
}

/** 顶部加载演示：初始为最近一页，还可向顶部加载更早 2 页 */
export function createStorybookChatMessageListLoadOlderInitialMessages(): ChatMessage[] {
  return createStorybookChatMessageListPage(2, 10)
}

export const storybookChatMessageListLoadOlderPageSize = 6
export const storybookChatMessageListLoadOlderMaxExtraPages = 2
export const storybookChatMessageListLoadOlderFetchDelayMs = 700
