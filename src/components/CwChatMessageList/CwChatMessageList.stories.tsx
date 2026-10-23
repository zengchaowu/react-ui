import { useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { CwLoading } from '../CwLoading'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { storybookChatWalletRedEnvelopeIconSrc as chatWalletRedEnvelopeIcon } from '../../storybook/chatWalletDemoAssets'
import {
  openStorybookChatMessageBatchContextMenu,
  openStorybookChatMessageContextMenu,
  storybookChatDownloadByUrl,
  storybookChatMessageListContentClass,
  storybookChatMessageListFrameClass,
  storybookChatMessageListHintClass,
  storybookChatMessageListNarrowBreakpointPx,
  storybookChatMessageListNarrowLayoutBreakpointPx,
  storybookChatMessageListRootClass,
  storybookChatMessageListSampleMessages,
  createStorybookChatMessageListPage,
  createStorybookChatMessageListLoadOlderInitialMessages,
  storybookChatMessageListLoadOlderFetchDelayMs,
  storybookChatMessageListLoadOlderMaxExtraPages,
  storybookChatMessageListLoadOlderPageSize,
  storybookChatMessageSelectable,
} from '../../storybook/chatMessageListStoryDemo'
import { CwChatMessageList } from './CwChatMessageList'
import type { CwChatMessageListProps } from './types'

const meta: Meta<typeof CwChatMessageList> = {
  title: '1. Components/Chat/CwChatMessageList',
  component: CwChatMessageList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '聊天消息滚动列表。需配合 `rootClass` / `contentClass` 提供左右边距；`hasOlder` + `onLoadOlder` 启用顶部加载更早消息；`drag-to-enter-selection-enabled` 启用空白处框选进入多选；`@contextmenu` 由宿主弹出右键菜单。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: { type: 'boolean' } },
    showPeerSenderInMultiParty: { control: { type: 'boolean' } },
    onPeerAvatarClick: { action: 'peer-avatar-click' },
    onContextMenu: { action: 'contextmenu' },
    onDragEnterSelection: { action: 'drag-enter-selection' },
    onSelectedIdsChange: { action: 'update:selectedIds' },
  },
  args: {
    peerAvatarFallbackSrc: chatDefaultAvatar,
    mentionAvatarFallbackSrc: chatDefaultAvatar,
    walletRedEnvelopeIconSrc: chatWalletRedEnvelopeIcon,
    downloadByUrl: storybookChatDownloadByUrl,
    rootClass: storybookChatMessageListRootClass,
    contentClass: storybookChatMessageListContentClass,
    narrowLayoutBreakpointPx: storybookChatMessageListNarrowBreakpointPx,
    messageSelectable: storybookChatMessageSelectable,
    dragToEnterSelectionEnabled: true,
    mediaBubbleMaxSide: 480,
  },
}

export default meta
type Story = StoryObj<typeof CwChatMessageList>

function ChatLikeList({
  args,
  messages,
  selectionActiveInitially = false,
  hint,
  frameClass = storybookChatMessageListFrameClass,
  outerMaxWidthClass = 'max-w-[50rem]',
}: {
  args: CwChatMessageListProps
  messages: ChatMessage[]
  selectionActiveInitially?: boolean
  hint: string
  frameClass?: string
  outerMaxWidthClass?: string
}) {
  const [selectionActive, setSelectionActive] = useState(selectionActiveInitially)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastMenuAction, setLastMenuAction] = useState('')

  function onDragEnterSelection(message: ChatMessage) {
    setSelectionActive(true)
    setSelectedIds((prev) => (prev.length === 0 ? [String(message.id)] : prev))
  }

  function onListContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    if (selectionActive && selectedIds.length > 0) {
      const opened = openStorybookChatMessageBatchContextMenu({
        event: event.nativeEvent,
        selectedCount: selectedIds.length,
        onSelect: (key) => {
          setLastMenuAction(`批量 · ${key}`)
        },
      })
      if (opened) return
    }
    const opened = openStorybookChatMessageContextMenu({
      messages,
      event: event.nativeEvent,
      onSelect: (key, message) => {
        setLastMenuAction(`${message.id} · ${key}`)
      },
    })
    if (!opened) setLastMenuAction('')
  }

  return (
    <div className={`mx-auto flex w-full flex-col gap-2 ${outerMaxWidthClass}`}>
      <p className="m-0 text-xs text-[var(--text-color-secondary)]">{hint}</p>
      <div className={frameClass}>
        <p className={storybookChatMessageListHintClass}>
          {selectionActive ? (
            <>多选中 · 已选 {selectedIds.length} 条 · 空白处右键可演示批量菜单</>
          ) : (
            <>在列表空白处按住拖动可框选进入多选；在消息气泡上右键打开菜单</>
          )}
          {lastMenuAction ? (
            <span className="ml-2 text-[var(--brand-color-6)]">（{lastMenuAction}）</span>
          ) : null}
        </p>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <CwChatMessageList
            {...args}
            messages={messages}
            selectionEnabled={selectionActive}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onDragEnterSelection={onDragEnterSelection}
            onContextMenu={onListContextMenu}
          />
        </div>
      </div>
    </div>
  )
}

function SimpleListDemo({ args }: { args: CwChatMessageListProps }) {
  return (
    <div className={storybookChatMessageListFrameClass}>
      <CwChatMessageList {...args} />
    </div>
  )
}

function LoadOlderAtTopDemo({ args }: { args: CwChatMessageListProps }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createStorybookChatMessageListLoadOlderInitialMessages(),
  )
  const [remainingPageIndexes, setRemainingPageIndexes] = useState<number[]>(() =>
    Array.from(
      { length: storybookChatMessageListLoadOlderMaxExtraPages },
      (_, i) => storybookChatMessageListLoadOlderMaxExtraPages - 1 - i,
    ),
  )
  const [hasOlder, setHasOlder] = useState(true)
  const [fetchingOlder, setFetchingOlder] = useState(false)
  const [loadedPageCount, setLoadedPageCount] = useState(0)
  const [statusText, setStatusText] = useState(
    '列表默认贴底；向上滚到顶部附近会自动加载更早消息并 prepend',
  )

  async function onLoadOlder() {
    if (!hasOlder || fetchingOlder) return
    const pageIndex = remainingPageIndexes[0]
    if (pageIndex == null) {
      setHasOlder(false)
      return
    }
    setRemainingPageIndexes((prev) => prev.slice(1))
    setFetchingOlder(true)
    try {
      await new Promise((resolve) => {
        setTimeout(resolve, storybookChatMessageListLoadOlderFetchDelayMs)
      })
      const older = createStorybookChatMessageListPage(
        pageIndex,
        storybookChatMessageListLoadOlderPageSize,
      )
      setMessages((prev) => [...older, ...prev])
      const nextCount = loadedPageCount + 1
      setLoadedPageCount(nextCount)
      const restCount = remainingPageIndexes.length - 1
      if (restCount === 0) {
        setHasOlder(false)
        setStatusText(`已加载全部 ${nextCount} 页更早消息（已无更多）`)
      } else {
        setStatusText(`已 prepend ${nextCount} 页；继续上滚还可加载 ${restCount} 页`)
      }
    } finally {
      setFetchingOlder(false)
    }
  }

  function onListContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    openStorybookChatMessageContextMenu({ messages, event: event.nativeEvent })
  }

  return (
    <div className="mx-auto flex w-full max-w-[50rem] flex-col gap-2">
      <p className="m-0 text-xs text-[var(--text-color-secondary)]">{statusText}</p>
      <div className={storybookChatMessageListFrameClass}>
        <p className={storybookChatMessageListHintClass}>
          与会话页相同：<code className="text-[var(--brand-color-6)]">hasOlder</code> + <code className="text-[var(--brand-color-6)]">onLoadOlder</code>；
          在距顶部约 180px 内且继续向上滚时触发（见 <code>CW_CHAT_MESSAGE_LIST_SCROLL_TOP_TRIGGER</code>）。
        </p>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <CwChatMessageList
            {...args}
            messages={messages}
            hasOlder={hasOlder}
            onLoadOlder={onLoadOlder}
            showPeerSenderInMultiParty
            onContextMenu={onListContextMenu}
            prependSlot={
              fetchingOlder ? (
                <div className="flex w-full justify-center py-2">
                  <CwLoading type="spinner" size="small" />
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    messages: storybookChatMessageListSampleMessages,
    loading: false,
    showPeerSenderInMultiParty: true,
  },
  render: (args) => (
    <ChatLikeList
      args={args}
      messages={storybookChatMessageListSampleMessages}
      hint="与会话页一致：左右 px-3 边距 · 气泡内可拖选文字 · 空白处拖选进入多选 · 气泡右键打开菜单"
    />
  ),
}

export const Empty: Story = {
  args: {
    messages: [],
    loading: false,
  },
  render: (args) => <SimpleListDemo args={args} />,
}

export const LoadingOverlay: Story = {
  args: {
    messages: [],
    loading: true,
  },
  render: (args) => <SimpleListDemo args={args} />,
}

/** 已进入多选：左侧勾选框 + 行点击切换 */
export const WithCheckboxSelection: Story = {
  args: {
    messages: storybookChatMessageListSampleMessages,
    loading: false,
    showPeerSenderInMultiParty: true,
  },
  render: (args) => (
    <ChatLikeList
      args={args}
      messages={storybookChatMessageListSampleMessages}
      selectionActiveInitially
      hint="多选已开启：点击行切换勾选；仍可在空白处拖选追加范围。"
    />
  ),
}

/** 列表视口 ≤768px 时隐藏头像列（窄屏/窄分栏） */
export const NarrowLayout: Story = {
  args: {
    messages: storybookChatMessageListSampleMessages,
    loading: false,
    showPeerSenderInMultiParty: true,
    narrowLayoutBreakpointPx: storybookChatMessageListNarrowLayoutBreakpointPx,
  },
  render: (args) => (
    <ChatLikeList
      args={args}
      messages={storybookChatMessageListSampleMessages}
      hint="窄屏断点 768px：容器较窄时会隐藏左侧头像列，仅保留昵称行。"
      outerMaxWidthClass="max-w-[22rem]"
      frameClass="flex h-[min(42rem,calc(100vh-2rem))] w-full flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--chat-message-area-bg)] shadow-sm"
    />
  ),
}

/** 滚到顶部附近自动 prepend 更早消息（`onLoadOlder` / `hasOlder`） */
export const LoadOlderAtTop: Story = {
  render: (args) => <LoadOlderAtTopDemo args={args} />,
}
