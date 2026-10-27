import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import CwChatMessageCell from '../CwChatMessageCell/CwChatMessageCell'
import CwCheckbox from '../CwCheckbox/CwCheckbox'
import CwInfiniteScroll from '../CwInfiniteScroll/CwInfiniteScroll'
import type { CwInfiniteScrollHandle } from '../CwInfiniteScroll/types'
import {
  isViewportAtBottom,
  scheduleScrollRetries,
  scrollViewportToBottom,
} from '../CwInfiniteScroll/scrollViewport'
import CwLoading from '../CwLoading/CwLoading'
import { CW_CHAT_MESSAGE_LIST_SCROLL_TOP_TRIGGER } from '@zengchaowu/ui-shared/components/CwChatMessageList/constants'
import { defaultCwChatMessageCellTexts } from '@zengchaowu/ui-shared/components/CwChatMessageCell/texts'
import type { CwChatOwnMessageEditSubmitPayload } from '../CwChatMessageCell/types'
import type { CwChatMessageListProps } from './types'
import { useChatMessageListLasso } from './lassoSelection'
import { messageListBase } from './styles'
import { defaultCwChatMessageListTexts } from '@zengchaowu/ui-shared/components/CwChatMessageList/texts'
import { useDelayedTrue } from '../../utils/appThemeDom'
import { useChatMessageTouchLongPress } from './useChatMessageTouchLongPress'
import { buildWorkspaceMessageTurns } from '@zengchaowu/ui-shared/components/CwChatMessageList/workspaceMessageTurns'
import { isFinePointerPrimaryInput } from '../../utils/appThemeDom'
import {
  CwPublicAssetBaseUrlContext,
  resolveDefaultPublicAssetBaseUrl,
} from '../../utils/publicAssetBaseUrl'

const QUOTE_NAV_HIGHLIGHT_MS = 1600

const EMPTY_SELECTED_IDS: string[] = []

export interface CwChatMessageListHandle {
  getViewport: () => HTMLElement | null
  getContent: () => HTMLElement | null
  scrollToBottom: () => void
  scrollToMessage: (messageId: string) => boolean
  infiniteScrollRef: React.RefObject<CwInfiniteScrollHandle | null>
}

function shouldPinAfterContentChange(
  loading: boolean,
  isLoadingOlder: boolean,
  len: number,
  prev: readonly [boolean, boolean, number] | undefined,
): boolean {
  if (loading || isLoadingOlder || len === 0) return false
  if (!prev) return true
  return prev[0] || prev[2] === 0
}

export const CwChatMessageList = forwardRef<
  CwChatMessageListHandle,
  CwChatMessageListProps
>(function CwChatMessageList(
  {
    messages,
    loading = false,
    loadingDelayMs = 500,
    showPeerSenderInMultiParty = true,
    mentionLabelResolver,
    mentionProfileResolver,
    mentionAvatarFallbackSrc,
    peerAvatarFallbackSrc,
    downloadByUrl,
    fileDownloadProgressResolver,
    revealLocalFile,
    mediaBubbleMaxSide = 480,
    rootClass = '',
    contentClass = '',
    texts: textsProp,
    messageCellTexts: messageCellTextsProp,
    narrowLayoutBreakpointPx = null,
    alwaysFullWidthBubbles = false,
    selectionEnabled = false,
    selectedIds = EMPTY_SELECTED_IDS,
    messageSelectable,
    dragToEnterSelectionEnabled = false,
    messageRowExtraClass = '',
    peerBubbleAppearance,
    layoutVariant = 'default',
    mentionItems,
    aiReplyActive = false,
    peerSenderHeaderClickMode = 'profile',
    messageCollapsed,
    showAssistantActions,
    assistantActionsDisabled,
    assistantActionsRevealOnHover,
    assistantFeedbackVote,
    assistantSpeechPlaying,
    walletRedEnvelopeIconSrc,
    walletRedEnvelopeTexts,
    walletTransferTexts,
    forwardBundleTexts,
    markdownCodeBlockPreviewLanguages,
    publicAssetBaseUrl,
    viewerUserId,
    walletTransferProfileResolver,
    hasOlder = false,
    onLoadOlder,
    scrollTopTrigger = CW_CHAT_MESSAGE_LIST_SCROLL_TOP_TRIGGER,
    touchLongPressMenuEnabled = false,
    onScroll,
    onLongPress,
    onPeerAvatarClick,
    onMentionProfileClick,
    onRetryAgentProxy,
    onRetryOutbound,
    onAttachmentPreviewOpen,
    onOpenPath,
    onInlineAttachmentsOpen,
    onForwardBundleOpen,
    onKnowledgeSourceClick,
    onMessageClick,
    onOwnMessageEditSubmit,
    onStopAiReply,
    onMarkdownCodeBlockCopy,
    onMarkdownCodeBlockPreview,
    onMarkdownImageContextMenu,
    onAssistantActionSpeech,
    onAssistantActionCopy,
    onAssistantActionFeedback,
    onSelectedIdsChange,
    onDragEnterSelection,
    prependSlot,
    appendSlot,
    ownSideActionSlot,
    assistantMessageShareSlot,
    onContextMenu,
    className,
    ...rest
  },
  ref,
) {
  const texts = useMemo(
    () => ({ ...defaultCwChatMessageListTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const messageCellTexts = useMemo(
    () => ({ ...defaultCwChatMessageCellTexts, ...(messageCellTextsProp ?? {}) }),
    [messageCellTextsProp],
  )

  const [editingOwnMessageId, setEditingOwnMessageId] = useState<string | null>(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [quoteHighlightMessageId, setQuoteHighlightMessageId] = useState<string | null>(null)
  const [isNarrowViewport, setIsNarrowViewport] = useState(false)
  const [lassoOverlayHostEl, setLassoOverlayHostEl] = useState<HTMLElement | null>(null)

  const listRootRef = useRef<HTMLDivElement | null>(null)
  const infiniteScrollRef = useRef<CwInfiniteScrollHandle | null>(null)
  const stickToBottomRef = useRef(true)
  const contentResizeObserverRef = useRef<ResizeObserver | null>(null)
  const lastObservedScrollHeightRef = useRef(0)
  const narrowLayoutObserverRef = useRef<ResizeObserver | null>(null)
  const quoteHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPinStateRef = useRef<readonly [boolean, boolean, number] | undefined>(undefined)

  const messageIdSet = useMemo(
    () => new Set((messages ?? []).map((m) => String(m.id))),
    [messages],
  )

  useEffect(() => {
    const editing = editingOwnMessageId
    if (editing && !messageIdSet.has(editing)) {
      setEditingOwnMessageId(null)
    }
  }, [messageIdSet, editingOwnMessageId])

  function onOwnMessageEditStart(message: ChatMessage) {
    if (selectionEnabled) return
    setEditingOwnMessageId(String(message.id))
  }

  function onOwnMessageEditCancel(message: ChatMessage) {
    if (editingOwnMessageId === String(message.id)) {
      setEditingOwnMessageId(null)
    }
  }

  function handleOwnMessageEditSubmit(payload: CwChatOwnMessageEditSubmitPayload) {
    setEditingOwnMessageId(null)
    onOwnMessageEditSubmit?.(payload)
  }

  const latestOwnMessageId = useMemo(() => {
    if (layoutVariant !== 'workspace' || !aiReplyActive) return null
    for (let i = (messages?.length ?? 0) - 1; i >= 0; i--) {
      const m = messages[i]!
      if (m.isOwn && m.type !== 'system') return String(m.id)
    }
    return null
  }, [layoutVariant, aiReplyActive, messages])

  /** workspace：按己方轮次分组，sticky 边界落在每轮容器内 */
  const messageTurns = useMemo(
    () =>
      layoutVariant === 'workspace'
        ? buildWorkspaceMessageTurns(messages)
        : [{ key: 'flat', stickyOwnId: null as string | null, messages: messages ?? [] }],
    [layoutVariant, messages],
  )

  const resolvedPublicAssetBaseUrl = useMemo(
    () => publicAssetBaseUrl?.trim() || resolveDefaultPublicAssetBaseUrl(),
    [publicAssetBaseUrl],
  )

  const loadingOverlayVisible = useDelayedTrue(loading, loadingDelayMs)

  const scrollRootClass = useMemo(
    () => [messageListBase.scrollRoot, rootClass].filter(Boolean).join(' ').trim(),
    [rootClass],
  )

  const contentClassMerged = useMemo(() => {
    const host = (contentClass ?? '').trim()
    if (layoutVariant === 'workspace') {
      // 去掉宿主左右 padding（改用 contentWorkspace）；去掉顶 padding，
      // 与 sticky 行 `top-0` + `!pt-2` 对齐，避免首条离顶比吸顶态更大。
      // `py-*` 保留为底 padding（pb）。
      const withoutHostPad = host
        .replace(/\bpx-\S+/g, '')
        .replace(/\bpy-(\S+)/g, 'pb-$1')
        .replace(/\bpt-\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      return [messageListBase.content, withoutHostPad, messageListBase.contentWorkspace]
        .filter(Boolean)
        .join(' ')
        .trim()
    }
    return [messageListBase.content, host].filter(Boolean).join(' ').trim()
  }, [contentClass, layoutVariant])

  const getViewport = useCallback(
    (): HTMLElement | null => infiniteScrollRef.current?.getContainer() ?? null,
    [],
  )

  const getScrollContent = useCallback(
    (): HTMLElement | null => infiniteScrollRef.current?.getContent() ?? null,
    [],
  )

  const pullDownEnabled = !!(onLoadOlder && hasOlder && !loadingOlder)

  async function triggerLoadOlder() {
    if (!pullDownEnabled || !onLoadOlder) return
    setLoadingOlder(true)
    try {
      await onLoadOlder()
    } finally {
      setLoadingOlder(false)
    }
  }

  function teardownContentResizeObserver() {
    contentResizeObserverRef.current?.disconnect()
    contentResizeObserverRef.current = null
  }

  const setupContentResizeObserver = useCallback(() => {
    teardownContentResizeObserver()
    if (typeof ResizeObserver === 'undefined') return
    const content = getScrollContent()
    const viewport = getViewport()
    if (!content || !viewport) return
    lastObservedScrollHeightRef.current = viewport.scrollHeight
    contentResizeObserverRef.current = new ResizeObserver(() => {
      if (!stickToBottomRef.current) return
      const el = getViewport()
      if (!el) return
      const nextHeight = el.scrollHeight
      if (nextHeight <= lastObservedScrollHeightRef.current + 0.5) {
        lastObservedScrollHeightRef.current = nextHeight
        return
      }
      lastObservedScrollHeightRef.current = nextHeight
      scrollViewportToBottom(el)
    })
    contentResizeObserverRef.current.observe(content)
  }, [getScrollContent, getViewport])

  const scrollToBottom = useCallback(() => {
    const viewport = getViewport()
    if (viewport) {
      scrollViewportToBottom(viewport)
      lastObservedScrollHeightRef.current = viewport.scrollHeight
    } else {
      infiniteScrollRef.current?.scrollToBottom()
    }
    stickToBottomRef.current = true
  }, [getViewport])

  function onInfiniteScroll() {
    const viewport = getViewport()
    if (viewport) stickToBottomRef.current = isViewportAtBottom(viewport)
    onScroll?.()
  }

  const syncLassoOverlayHost = useCallback(() => {
    setLassoOverlayHostEl(getScrollContent())
  }, [getScrollContent])

  const clearQuoteHighlight = useCallback(() => {
    if (quoteHighlightTimerRef.current != null) {
      clearTimeout(quoteHighlightTimerRef.current)
      quoteHighlightTimerRef.current = null
    }
    setQuoteHighlightMessageId(null)
  }, [])

  function flashQuoteHighlight(messageId: string) {
    clearQuoteHighlight()
    setQuoteHighlightMessageId(messageId)
    quoteHighlightTimerRef.current = setTimeout(() => {
      quoteHighlightTimerRef.current = null
      setQuoteHighlightMessageId(null)
    }, QUOTE_NAV_HIGHLIGHT_MS)
  }

  function queryMessageRowEl(viewport: HTMLElement, messageId: string): HTMLElement | null {
    const id = String(messageId).trim()
    if (!id) return null
    try {
      const el = viewport.querySelector(`[data-cw-message-row-id="${CSS.escape(id)}"]`)
      return el instanceof HTMLElement ? el : null
    } catch {
      const el = viewport.querySelector(`[data-cw-message-row-id="${id}"]`)
      return el instanceof HTMLElement ? el : null
    }
  }

  /** 将列表滚动到指定消息行（用于点击引用条） */
  const scrollToMessage = useCallback(
    (messageId: string): boolean => {
      const viewport = getViewport()
      if (!viewport) return false
      const row = queryMessageRowEl(viewport, messageId)
      if (!row) return false
      row.scrollIntoView({ block: 'center', behavior: 'smooth' })
      flashQuoteHighlight(String(messageId).trim())
      return true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getViewport],
  )

  function onQuoteNavigate(messageId: string) {
    scrollToMessage(messageId)
  }

  const hasMessages = (messages?.length ?? 0) > 0

  /** workspace / Cursor 空会话不展示「暂无消息」 */
  const showEmptyState =
    !hasMessages && !loading && !appendSlot && layoutVariant !== 'workspace'

  const selectedIdSet = useMemo(() => new Set(selectedIds ?? []), [selectedIds])

  function isMessageSelectableForCheckbox(m: ChatMessage) {
    return messageSelectable ? messageSelectable(m) : true
  }

  function emitSelectedAfterToggle(messageId: string, checked: boolean) {
    const m = messages.find((x) => x.id === messageId)
    if (m && !isMessageSelectableForCheckbox(m)) return
    const next = new Set(selectedIdSet)
    if (checked) next.add(messageId)
    else next.delete(messageId)
    const ordered = messages.filter((x) => next.has(x.id)).map((x) => x.id)
    onSelectedIdsChange?.(ordered)
  }

  function onRowCheckboxModelUpdate(m: ChatMessage, value: boolean | 'indeterminate') {
    if (value === 'indeterminate') return
    if (!isMessageSelectableForCheckbox(m)) return
    emitSelectedAfterToggle(m.id, value === true)
  }

  /** 列表区接近「手机栏宽」时启用紧凑排版（头像列隐藏 + 气泡全宽） */
  const layoutIsNarrow = narrowLayoutBreakpointPx != null && isNarrowViewport

  /** 外层 cell + 内层 Markdown/Text 统一全宽（对方消息不再用窄屏 100%/宽屏 2/3 限制） */
  const cellBubblesFullWidth = !!(alwaysFullWidthBubbles || layoutIsNarrow)

  const {
    lassoBox,
    onColumnPointerDownCapture,
    consumeSuppressRowToggle,
  } = useChatMessageListLasso({
    messages,
    dragToEnterSelectionEnabled,
    selectionEnabled,
    messageSelectable,
    getViewport,
    onDragEnterSelection: (m) => onDragEnterSelection?.(m),
    onSelectedIdsChange: (ids) => onSelectedIdsChange?.(ids),
  })

  /** 多选：在消息正文区域点击切换勾选（capture 先于气泡内链接/图等） */
  function onMessageBodyPointerUpCapture(m: ChatMessage, e: ReactPointerEvent<HTMLDivElement>) {
    if (!selectionEnabled) return
    if (e.button !== 0 || !e.isPrimary) return
    if (consumeSuppressRowToggle()) return
    const target = e.target
    const el = target instanceof HTMLElement ? target : null
    if (el?.closest('[role="checkbox"]')) return
    if (!isMessageSelectableForCheckbox(m)) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    e.preventDefault()
    e.stopPropagation()
    emitSelectedAfterToggle(m.id, !selectedIdSet.has(m.id))
  }

  const measureNarrowLayout = useCallback(() => {
    if (narrowLayoutBreakpointPx == null) {
      setIsNarrowViewport(false)
      return
    }
    const el = getViewport()
    if (!el) return
    setIsNarrowViewport(el.clientWidth <= narrowLayoutBreakpointPx)
  }, [narrowLayoutBreakpointPx, getViewport])

  const detachNarrowLayoutObserver = useCallback(() => {
    narrowLayoutObserverRef.current?.disconnect()
    narrowLayoutObserverRef.current = null
  }, [])

  const attachNarrowLayoutObserver = useCallback(() => {
    detachNarrowLayoutObserver()
    if (narrowLayoutBreakpointPx == null) {
      setIsNarrowViewport(false)
      return
    }
    const el = getViewport()
    if (!el) return
    try {
      measureNarrowLayout()
      narrowLayoutObserverRef.current = new ResizeObserver(() => {
        measureNarrowLayout()
      })
      narrowLayoutObserverRef.current.observe(el)
    } catch {
      narrowLayoutObserverRef.current = null
      measureNarrowLayout()
    }
  }, [detachNarrowLayoutObserver, getViewport, measureNarrowLayout, narrowLayoutBreakpointPx])

  const messageRowInnerClass = selectionEnabled
    ? messageListBase.messageRowSelectionInner
    : undefined

  const messageRowClass =
    layoutVariant === 'workspace'
      ? messageListBase.messageRowWorkspace
      : messageListBase.messageRow

  useEffect(() => {
    syncLassoOverlayHost()
    attachNarrowLayoutObserver()
    setupContentResizeObserver()
  }, [
    narrowLayoutBreakpointPx,
    messages?.length ?? 0,
    loading,
    syncLassoOverlayHost,
    attachNarrowLayoutObserver,
    setupContentResizeObserver,
  ])

  /** 切换会话 / 首屏加载：在绘制前同步贴底，避免先显示顶部再跳动 */
  useLayoutEffect(() => {
    const curr = [loading, loadingOlder, messages?.length ?? 0] as const
    const prev = prevPinStateRef.current
    prevPinStateRef.current = curr
    if (!shouldPinAfterContentChange(curr[0], curr[1], curr[2], prev)) return
    scrollToBottom()
  }, [loading, loadingOlder, messages?.length, scrollToBottom])

  useEffect(() => {
    const root = listRootRef.current
    if (!root) return
    // 首次挂载后兜底贴底（含 KeepAlive 等价场景）
    if (hasMessages && !loading) {
      scheduleScrollRetries(scrollToBottom)
    }
    return () => {
      teardownContentResizeObserver()
      detachNarrowLayoutObserver()
      clearQuoteHighlight()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function touchLongPressMenuActive() {
    return touchLongPressMenuEnabled && !selectionEnabled
  }

  function shouldBlockContextMenuForTouchLongPress(): boolean {
    if (!touchLongPressMenuActive()) return false
    // 窄屏布局 + 鼠标/触控板：仍走桌面右键菜单，仅触屏长按才拦截合成 contextmenu
    if (isFinePointerPrimaryInput()) return false
    return true
  }

  function onMessageListContextMenu(e: ReactMouseEvent<HTMLDivElement>) {
    if (shouldBlockContextMenuForTouchLongPress()) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onContextMenu?.(e)
  }

  useChatMessageTouchLongPress({
    rootRef: listRootRef,
    enabled: touchLongPressMenuActive,
    onLongPress: (payload) => {
      const m = messages.find((x) => String(x.id) === payload.messageId)
      if (!m) return
      onLongPress?.({
        message: m,
        clientX: payload.clientX,
        clientY: payload.clientY,
        bubbleEl: payload.bubbleEl,
      })
    },
  })

  useImperativeHandle(
    ref,
    () => ({
      getViewport,
      getContent: getScrollContent,
      scrollToBottom,
      scrollToMessage,
      infiniteScrollRef,
    }),
    [getViewport, getScrollContent, scrollToBottom, scrollToMessage],
  )

  return (
    <CwPublicAssetBaseUrlContext.Provider value={resolvedPublicAssetBaseUrl}>
      <div
        {...rest}
        ref={listRootRef}
        className={[messageListBase.root, className].filter(Boolean).join(' ')}
        aria-busy={loading ? 'true' : undefined}
        onContextMenu={onMessageListContextMenu}
      >
        <CwInfiniteScroll
          ref={infiniteScrollRef}
          className={scrollRootClass}
          scrollTopTrigger={scrollTopTrigger}
          pullDownEnabled={pullDownEnabled}
          pullUpEnabled={false}
          triggerPullDown={onLoadOlder ? triggerLoadOlder : undefined}
          onScroll={onInfiniteScroll}
        >
          <div className={contentClassMerged}>
            {hasMessages || appendSlot ? (
              <div
                className={messageListBase.messagesColumn}
                onPointerDownCapture={onColumnPointerDownCapture}
              >
                {prependSlot ? (
                  <div className={messageListBase.prepend}>{prependSlot}</div>
                ) : null}
                {messageTurns.map((turn) => (
                  <div
                    key={turn.key}
                    className={
                      layoutVariant === 'workspace'
                        ? messageListBase.messageTurnWorkspace
                        : 'contents'
                    }
                  >
                    {turn.messages.map((m) => (
                      <div
                        key={m.id}
                        data-cw-message-row-id={String(m.id)}
                        className={[
                          messageRowClass,
                          messageRowExtraClass,
                          turn.stickyOwnId === String(m.id) &&
                            messageListBase.messageRowStickyOwn,
                          selectionEnabled && messageListBase.messageRowSelectionHost,
                          selectionEnabled &&
                            (isMessageSelectableForCheckbox(m)
                              ? messageListBase.messageRowSelectionClickable
                              : messageListBase.messageRowSelectionDisabled),
                          quoteHighlightMessageId === String(m.id) &&
                            messageListBase.messageRowQuoteHighlight,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onPointerUpCapture={
                          selectionEnabled
                            ? (e) => onMessageBodyPointerUpCapture(m, e)
                            : undefined
                        }
                      >
                        {selectionEnabled &&
                        isMessageSelectableForCheckbox(m) &&
                        selectedIdSet.has(m.id) ? (
                          <div
                            className={[
                              messageListBase.messageRowSelectedScrim,
                              messageListBase.messageRowSelectedBg,
                            ].join(' ')}
                          />
                        ) : null}
                        <div className="contents">
                          {m.type === 'system' ? (
                            <div className="flex w-full justify-center px-4 py-1.5">
                              <span className="max-w-full text-center leading-snug text-[var(--text-color-secondary)] [font-size:var(--font-size-caption)]">
                                {m.content}
                              </span>
                            </div>
                          ) : (
                            <div className={messageRowInnerClass}>
                              <CwChatMessageCell
                                message={m}
                                peerAvatarFallbackSrc={peerAvatarFallbackSrc}
                                downloadByUrl={downloadByUrl}
                                fileDownloadProgressResolver={fileDownloadProgressResolver}
                                revealLocalFile={revealLocalFile}
                                mediaBubbleMaxSide={mediaBubbleMaxSide}
                                showPeerSenderInMultiParty={showPeerSenderInMultiParty}
                                mentionLabelResolver={mentionLabelResolver}
                                mentionProfileResolver={mentionProfileResolver}
                                mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
                                hidePeerAvatarColumn={layoutIsNarrow}
                                peerSenderHeaderClickMode={peerSenderHeaderClickMode}
                                collapsed={messageCollapsed?.(m.id) ?? false}
                                bubblesFullWidth={cellBubblesFullWidth}
                                interactionsDisabled={selectionEnabled}
                                peerBubbleAppearance={peerBubbleAppearance}
                                layoutVariant={layoutVariant}
                                ownMessageEditing={editingOwnMessageId === String(m.id)}
                                showOwnMessageStop={
                                  latestOwnMessageId === String(m.id) && !!aiReplyActive
                                }
                                mentionItems={mentionItems}
                                showAssistantActions={showAssistantActions}
                                assistantActionsDisabled={assistantActionsDisabled}
                                assistantActionsRevealOnHover={assistantActionsRevealOnHover}
                                assistantFeedbackVote={assistantFeedbackVote}
                                assistantSpeechPlaying={assistantSpeechPlaying}
                                texts={messageCellTexts}
                                walletRedEnvelopeIconSrc={walletRedEnvelopeIconSrc}
                                walletRedEnvelopeTexts={walletRedEnvelopeTexts}
                                walletTransferTexts={walletTransferTexts}
                                forwardBundleTexts={forwardBundleTexts}
                                markdownCodeBlockPreviewLanguages={markdownCodeBlockPreviewLanguages}
                                viewerUserId={viewerUserId}
                                walletTransferProfileResolver={walletTransferProfileResolver}
                                onPeerAvatarClick={onPeerAvatarClick}
                                onQuoteNavigate={onQuoteNavigate}
                                onRetryAgentProxy={onRetryAgentProxy}
                                onRetryOutbound={onRetryOutbound}
                                onAttachmentPreviewOpen={onAttachmentPreviewOpen}
                                onOpenPath={onOpenPath}
                                onInlineAttachmentsOpen={onInlineAttachmentsOpen}
                                onForwardBundleOpen={onForwardBundleOpen}
                                onKnowledgeSourceClick={onKnowledgeSourceClick}
                                onClick={onMessageClick}
                                onOwnMessageEditStart={onOwnMessageEditStart}
                                onOwnMessageEditSubmit={handleOwnMessageEditSubmit}
                                onOwnMessageEditCancel={onOwnMessageEditCancel}
                                onStopAiReply={onStopAiReply}
                                onMarkdownCodeBlockCopy={onMarkdownCodeBlockCopy}
                                onMarkdownCodeBlockPreview={onMarkdownCodeBlockPreview}
                                onMarkdownImageContextMenu={onMarkdownImageContextMenu}
                                onMentionProfileClick={onMentionProfileClick}
                                onAssistantActionSpeech={onAssistantActionSpeech}
                                onAssistantActionCopy={onAssistantActionCopy}
                                onAssistantActionFeedback={onAssistantActionFeedback}
                                ownSideActionSlot={
                                  ownSideActionSlot
                                    ? (scope) => ownSideActionSlot(scope)
                                    : undefined
                                }
                                assistantShareSlot={
                                  assistantMessageShareSlot
                                    ? (scope) => assistantMessageShareSlot(scope)
                                    : undefined
                                }
                              />
                            </div>
                          )}
                        </div>
                        {selectionEnabled && m.type !== 'system' ? (
                          <div
                            className={messageListBase.selectionCheckboxAbs}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CwCheckbox
                              value={selectedIdSet.has(m.id)}
                              disabled={!isMessageSelectableForCheckbox(m)}
                              size="small"
                              onChange={(value) => onRowCheckboxModelUpdate(m, value)}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
                {appendSlot ? (
                  <div className={messageListBase.append}>{appendSlot}</div>
                ) : null}
                {layoutVariant === 'workspace' ? (
                  <div className={messageListBase.bottomSpacerWorkspace} aria-hidden="true" />
                ) : null}
              </div>
            ) : null}
          </div>
        </CwInfiniteScroll>
        {lassoOverlayHostEl && lassoBox
          ? createPortal(
              <div
                className={messageListBase.lassoBox}
                style={{
                  left: `${lassoBox.left}px`,
                  top: `${lassoBox.top}px`,
                  width: `${lassoBox.width}px`,
                  height: `${lassoBox.height}px`,
                }}
              />,
              lassoOverlayHostEl,
            )
          : null}
        {showEmptyState ? (
          <div className={messageListBase.emptyState}>
            <div className={messageListBase.emptyHint}>{texts.empty}</div>
          </div>
        ) : null}
        {loadingOverlayVisible ? (
          <div className={messageListBase.loadingOverlay}>
            <CwLoading type="spinner" size="medium" />
          </div>
        ) : null}
      </div>
    </CwPublicAssetBaseUrlContext.Provider>
  )
})

export default CwChatMessageList
