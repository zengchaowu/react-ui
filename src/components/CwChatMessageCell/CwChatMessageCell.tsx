import { useEffect, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import { formatChatMessageLlmContextLabel } from '@zengchaowu/shared/functions/im/imLlmContextLabel'
import { chatMessageHidesFooterTime } from '@zengchaowu/shared/functions/im/imChatMessageFooterMeta'
import CwAvatar from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../CwAvatar/cwAvatarPresets'
import CwChatMessageCellBubbles from './CwChatMessageCellBubbles'
import CwChatMessageCellAssistantActions from './CwChatMessageCellAssistantActions'
import CwChatMessageOwnEdit from './CwChatMessageOwnEdit'
import CwChatMessageQuote from '../CwChatMessageQuote/CwChatMessageQuote'
import CwIcon from '../CwIcon/CwIcon'
import CwLoading from '../CwLoading/CwLoading'
import CwTooltip from '../CwTooltip/CwTooltip'
import type {
  CwChatAttachmentPreviewOpenPayload,
  CwChatMessageCellProps,
  CwChatMessageMarkdownCodeBlockCopyPayload,
  CwChatMessageMarkdownImageContextMenuPayload,
} from './types'
import { messageCellBase } from './styles'
import { defaultCwChatMessageCellTexts } from './texts'
import {
  CHAT_BUBBLE_MAX_WIDTH_CLASS,
  CHAT_CARD_BUBBLE_BODY_INNER_CLASS,
  CHAT_CARD_BUBBLE_WRAPPER_CLASS,
  chatCardBubbleWrapperMaxWidthStyle,
} from './chatMessageBubbleLayout'
import {
  chatMessageFooterMetaTextClass,
  chatMessageMetaTextClass,
} from './chatMessageTypography'
import {
  CW_WORKSPACE_CHAT_RADIUS,
  CW_WORKSPACE_OWN_OUTLINED_BUBBLE,
} from './chatWorkspaceSurface'
import {
  hasNonCollapsedTextSelection,
  isWorkspaceOwnMessageEditable,
} from './ownMessageEdit'

const peerSenderNameClass = `${chatMessageMetaTextClass} leading-none text-[var(--text-color-placeholder)]`
const inlineAttachmentCountClass = `${chatMessageFooterMetaTextClass} leading-none`

/** 与 workspace composer 发送/停止图标同尺寸 */
const OWN_MESSAGE_STOP_ICON_SIZE = 1.5
const OWN_MESSAGE_RETRY_ICON_SIZE = 1.125

const ownQuoteBubbleWrapperMaxWidthStyle = chatCardBubbleWrapperMaxWidthStyle()

const workspaceOwnChromeClass = [
  'flex w-full min-w-0 items-stretch overflow-hidden',
  CW_WORKSPACE_CHAT_RADIUS,
  CW_WORKSPACE_OWN_OUTLINED_BUBBLE,
].join(' ')

const workspaceOwnChromeBodyClass =
  'min-w-0 flex-1 overflow-hidden py-2.5 pl-2.5'

const workspaceOwnActionRailClass =
  'flex w-9 shrink-0 justify-center self-stretch pr-2.5'

/** 进行中：悬停显停止（触屏无 hover 时常显）；落在右侧操作轨内，纵向居中 */
const ownBubbleStopActionClass = [
  'outline-none',
  'opacity-0 transition-opacity duration-150 ease-out',
  'group-hover/own-bubble:opacity-100 focus-visible:opacity-100',
  '[@media(hover:none)]:opacity-100',
  'focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)]',
  'cw-chat-message-composer-workspace__stop inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--error-color-6)] transition-[color,opacity,transform] duration-200 ease-out hover:text-[var(--error-color-6)] hover:opacity-80 active:scale-95 active:text-[var(--error-color-6)] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:opacity-45',
].join(' ')

/** 重试：贴气泡右下（与正文底边对齐）；非进行中常显 */
const ownBubbleRetryActionClass = [
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0',
  'text-[var(--text-color-secondary)] outline-none transition-colors',
  'hover:text-[var(--text-color-primary)]',
  'focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)]',
].join(' ')

/** 失败 / 可重试：错误色强调 */
const ownBubbleRetryUrgentClass =
  'text-[var(--error-color-6)] hover:text-[var(--error-color-hover)]'

/**
 * 与「从这里继续」同一颗 28px 按钮。
 * 失败图标若只有字形宽，右缘虽和继续按钮对齐，字形中心会更贴气泡。
 */
const ownOutboundStatusIconButtonClass = [
  'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0',
  'text-[var(--error-color-6)] outline-none',
  'hover:text-[var(--error-color-hover)]',
  'focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-0',
].join(' ')

/** 图/视/文件出站 + 内联附件上传：排队、上传、落库阶段均算未完成（勿监听 phase 变化重置菊花） */
function isMediaOutboundInFlight(m: ChatMessage): boolean {
  if (m.mediaUploadPhase) return true
  const st = m.mediaUploadStatus
  return st === 'uploading' || st === 'uploaded'
}

/** 正文内联图 / 工具栏附件条：`extra_data.inline_uploading`，上传完成前常亮菊花（不走 delay） */
function isInlineRichContentUploading(m: ChatMessage): boolean {
  return m.inlineUploading === true
}

/** 距消息底边的 hover 热区：操作栏本身 + 正文最底部一小段 */
const ASSISTANT_ACTIONS_BOTTOM_HOVER_PX = 80

export function CwChatMessageCell({
  message,
  peerAvatarFallbackSrc,
  texts: textsProp,
  mediaBubbleMaxSide,
  showPeerSenderInMultiParty,
  mentionLabelResolver,
  mentionProfileResolver,
  mentionAvatarFallbackSrc,
  outboundSendingIndicatorDelayMs = 1000,
  hidePeerAvatarColumn = false,
  peerSenderProfileNavigable = true,
  peerSenderHeaderClickMode = 'profile',
  collapsed = false,
  bubblesFullWidth = false,
  interactionsDisabled = false,
  downloadByUrl,
  fileDownloadProgressResolver,
  revealLocalFile,
  peerBubbleAppearance,
  layoutVariant = 'default',
  ownMessageEditing = false,
  showOwnMessageStop = false,
  mentionItems,
  showAssistantActions,
  assistantActionsDisabled,
  assistantActionsRevealOnHover,
  assistantFeedbackVote,
  assistantSpeechPlaying,
  walletRedEnvelopeIconSrc,
  walletRedEnvelopeTexts,
  walletTransferTexts,
  forwardBundleTexts,
  viewerUserId,
  walletTransferProfileResolver,
  className,
  onClick,
  onQuoteNavigate,
  onPeerAvatarClick,
  onMentionProfileClick,
  onRetryAgentProxy,
  onRetryOutbound,
  onAttachmentPreviewOpen,
  onOpenPath,
  onInlineAttachmentsOpen,
  onForwardBundleOpen,
  onKnowledgeSourceClick: _onKnowledgeSourceClick,
  onMarkdownCodeBlockCopy,
  onMarkdownImageContextMenu,
  onAssistantActionSpeech,
  onAssistantActionCopy,
  onAssistantActionFeedback,
  onOwnMessageEditStart: onOwnMessageEditStartProp,
  onOwnMessageEditSubmit,
  onOwnMessageEditCancel,
  onStopAiReply,
  assistantShareSlot,
  ownSideActionSlot,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  ...rest
}: CwChatMessageCellProps) {
  const texts = { ...defaultCwChatMessageCellTexts, ...(textsProp ?? {}) }

  const isWorkspaceLayout = layoutVariant === 'workspace'

  const canEditOwnMessage =
    isWorkspaceLayout &&
    !interactionsDisabled &&
    !ownMessageEditing &&
    !showOwnMessageStop &&
    isWorkspaceOwnMessageEditable(message)

  const canStopOwnMessage =
    isWorkspaceLayout &&
    !!message.isOwn &&
    !interactionsDisabled &&
    !ownMessageEditing &&
    !!showOwnMessageStop

  const ownEditMentionAvatarFallbackSrc =
    mentionAvatarFallbackSrc?.trim() || peerAvatarFallbackSrc

  const showPeerHeader =
    !isWorkspaceLayout &&
    !!(showPeerSenderInMultiParty && message && !message.isOwn)

  const peerSenderHeaderCollapseMode = peerSenderHeaderClickMode === 'collapse'

  const peerSenderNameClickable = peerSenderHeaderCollapseMode
    ? true
    : hidePeerAvatarColumn && peerSenderProfileNavigable

  const peerAvatarOpensProfile =
    !peerSenderHeaderCollapseMode && !hidePeerAvatarColumn

  const peerSenderProfileAriaLabel = `查看 ${message.sender.name} 的资料`

  const peerSenderNameAriaLabel = peerSenderHeaderCollapseMode
    ? collapsed
      ? `展开 ${message.sender.name} 的消息`
      : `折叠 ${message.sender.name} 的消息`
    : peerSenderProfileAriaLabel

  function onPeerSenderHeaderClick() {
    onPeerAvatarClick?.(message)
  }

  function resolveMessageBoolProp(
    value: boolean | ((m: ChatMessage) => boolean) | undefined,
    m: ChatMessage,
  ): boolean {
    if (typeof value === 'function') return value(m)
    return !!value
  }

  const showAssistantActionsForMessage =
    !message.isOwn &&
    message.status !== 'sending' &&
    resolveMessageBoolProp(showAssistantActions, message)

  const [assistantFooterHot, setAssistantFooterHot] = useState(false)

  function onAssistantFooterPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (assistantActionsRevealOnHover !== true) return
    if (!showAssistantActionsForMessage) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    setAssistantFooterHot(
      rect.bottom - e.clientY <= ASSISTANT_ACTIONS_BOTTOM_HOVER_PX,
    )
  }

  function onAssistantFooterPointerLeave() {
    setAssistantFooterHot(false)
  }

  const assistantActionsDisabledForMessage = resolveMessageBoolProp(
    assistantActionsDisabled,
    message,
  )

  const assistantFeedbackVoteForMessage =
    assistantFeedbackVote?.(String(message.id)) ?? null

  const assistantSpeechPlayingForMessage =
    assistantSpeechPlaying?.(String(message.id)) ?? false

  const ownOutboundRowClass = [
    messageCellBase.ownOutboundRow,
    isWorkspaceLayout ? '!w-full justify-start' : '',
  ]
    .filter(Boolean)
    .join(' ')

  /** 己方气泡栈是否按内容收缩：默认布局始终 hug；workspace 仅在非全宽时 hug */
  const ownHugStackWidth = !isWorkspaceLayout || !bubblesFullWidth

  const ownBubbleColumnClass = (() => {
    const maxWidth = bubblesFullWidth ? 'max-w-full' : CHAT_BUBBLE_MAX_WIDTH_CLASS
    const width = isWorkspaceLayout && bubblesFullWidth ? 'w-full' : 'w-fit'
    return `min-w-0 ${width} ${maxWidth}`
  })()

  const metaOwnClasses = [
    messageCellBase.meta,
    isWorkspaceLayout ? messageCellBase.metaPeer : messageCellBase.metaOwn,
    isWorkspaceLayout ? '' : 'px-1',
    ...(bubblesFullWidth ? ['!max-w-full'] : []),
  ]
    .filter(Boolean)
    .join(' ')

  const metaPeerClasses = [
    messageCellBase.meta,
    messageCellBase.metaPeer,
    isWorkspaceLayout ? 'mt-1 px-0' : 'px-1',
    ...(bubblesFullWidth ? ['!max-w-full'] : []),
  ]
    .filter(Boolean)
    .join(' ')

  /** 用量行在复制/点赞工具栏上方，与工具栏左缘对齐 */
  const llmContextRowClasses = [
    chatMessageFooterMetaTextClass,
    'w-full min-w-0',
    isWorkspaceLayout ? 'mt-1 px-0' : 'mt-1 px-1',
    ...(bubblesFullWidth ? ['!max-w-full'] : []),
  ]
    .filter(Boolean)
    .join(' ')

  const llmContextMetaLabel = message.isOwn
    ? ''
    : formatChatMessageLlmContextLabel(message.llmContext)

  const hideFooterTime =
    (isWorkspaceLayout && !!message.isOwn) || chatMessageHidesFooterTime(message)

  const hasTime =
    !hideFooterTime &&
    ((!!message.timeLabel && message.timeLabel.length > 0) ||
      (!!message.clientTimeLabel && message.clientTimeLabel.length > 0))

  const showMeta = hasTime || (message.inlineAttachmentCount ?? 0) > 0

  const isOwnOutboundSending =
    !!message.isOwn && message.status === 'sending'

  const isOwnMediaOutboundInFlight =
    isOwnOutboundSending && isMediaOutboundInFlight(message)

  const isOwnInlineRichUploading =
    isOwnOutboundSending && isInlineRichContentUploading(message)

  const [showDelayedSendingSpinner, setShowDelayedSendingSpinner] =
    useState(false)
  const sendingIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  function clearSendingIndicatorTimer() {
    if (sendingIndicatorTimerRef.current != null) {
      clearTimeout(sendingIndicatorTimerRef.current)
      sendingIndicatorTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!isOwnOutboundSending) {
      clearSendingIndicatorTimer()
      setShowDelayedSendingSpinner(false)
      return
    }
    // 媒体 / 正文内联上传：发送完成前始终展示，不因 phase/进度刷新而重置
    if (
      isMediaOutboundInFlight(message) ||
      isInlineRichContentUploading(message)
    ) {
      clearSendingIndicatorTimer()
      setShowDelayedSendingSpinner(true)
      return
    }
    if (showDelayedSendingSpinner) return
    clearSendingIndicatorTimer()
    const delay = Math.max(0, outboundSendingIndicatorDelayMs)
    sendingIndicatorTimerRef.current = setTimeout(() => {
      sendingIndicatorTimerRef.current = null
      setShowDelayedSendingSpinner(true)
    }, delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    message.id,
    message.clientMessageId,
    message.isOwn,
    message.status,
    message.inlineUploading,
  ])

  useEffect(() => {
    return () => {
      clearSendingIndicatorTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 己方出站 sending：媒体与正文内联上传常亮；纯文本走 delay */
  const showSideSendingSpinner =
    isOwnOutboundSending &&
    (isOwnMediaOutboundInFlight ||
      isOwnInlineRichUploading ||
      showDelayedSendingSpinner)

  /** 己方出站发送失败（有 clientMessageId 时可重发） */
  const ownOutboundSendFailed =
    !!message.isOwn &&
    !message.agentProxyRetryable &&
    !!String(message.clientMessageId ?? '').trim() &&
    (message.status === 'failed' || message.mediaUploadStatus === 'failed')

  /** 失败 / 可重试：重试图标常显并用错误色 */
  const workspaceOwnRetryUrgent =
    !!message.agentProxyRetryable || ownOutboundSendFailed

  const workspaceOwnRetryAriaLabel = ownOutboundSendFailed
    ? texts.retryOutboundLabel
    : texts.retryAgentProxyLabel

  /** 己方出站失败但无 clientMessageId，仅展示不可重发 */
  const ownOutboundFailedReadonly =
    !!message.isOwn &&
    !message.agentProxyRetryable &&
    !String(message.clientMessageId ?? '').trim() &&
    (message.status === 'failed' || message.mediaUploadStatus === 'failed')

  /** 仅在有可见状态（失败图标 / 重试图标 / 延迟后的 sending 菊花）时占位，避免 delay 期间空槽 + gap 挤窄气泡 */
  const showOwnOutboundStatus = (() => {
    if (!message.isOwn) return false
    // workspace：重试进气泡右侧轨；左侧只保留发送中菊花 / 只读失败提示
    if (isWorkspaceLayout) {
      if (ownOutboundFailedReadonly) return true
      return showSideSendingSpinner
    }
    if (ownOutboundSendFailed || ownOutboundFailedReadonly) return true
    if (message.agentProxyRetryable) return true
    return showSideSendingSpinner
  })()

  /**
   * 发送失败 / 代理重试 / 发送中时，不要再挂「从这里继续」：
   * 它绝对定位在气泡左侧，会盖住红色失败感叹号（同为 retry-line 时更像图标被换掉）。
   */
  const suppressOwnSideAction =
    ownOutboundSendFailed ||
    ownOutboundFailedReadonly ||
    !!message.agentProxyRetryable ||
    showSideSendingSpinner

  /** 状态区域 aria-role；可重试时为 button，其余为 status */
  const statusRole =
    message.agentProxyRetryable || ownOutboundSendFailed ? undefined : 'status'

  const ownOutboundAriaLabel = (() => {
    if (!message.isOwn) return undefined
    if (ownOutboundSendFailed) return texts.retryOutboundLabel
    if (message.agentProxyRetryable) return texts.retryAgentProxyLabel
    if (showSideSendingSpinner) return texts.sendingLabel
    return undefined
  })()

  function onOwnQuoteNavigate() {
    const id = message.replyToMessageId
    if (id) onQuoteNavigate?.(String(id))
  }

  function emitClick() {
    onClick?.(message)
  }

  function onOwnMessageEditStart() {
    if (!canEditOwnMessage) return
    onOwnMessageEditStartProp?.(message)
  }

  function onOwnMessageStop() {
    if (!canStopOwnMessage) return
    onStopAiReply?.(message)
  }

  function onWorkspaceOwnRetry() {
    if (canStopOwnMessage || interactionsDisabled) return
    if (ownOutboundSendFailed) {
      onRetryOutbound?.(message)
      return
    }
    onRetryAgentProxy?.(message)
  }

  function onOwnBubblesClick() {
    if (canEditOwnMessage && !hasNonCollapsedTextSelection()) {
      onOwnMessageEditStart()
      return
    }
    emitClick()
  }

  function handleOwnMessageEditSubmit(payload: { html: string; files: File[] }) {
    onOwnMessageEditSubmit?.({ message, ...payload })
  }

  function handleOwnMessageEditCancel() {
    onOwnMessageEditCancel?.(message)
  }

  function emitAttachmentPreviewOpen(payload: CwChatAttachmentPreviewOpenPayload) {
    onAttachmentPreviewOpen?.(payload)
  }

  function emitMarkdownCodeBlockCopy(
    payload: CwChatMessageMarkdownCodeBlockCopyPayload,
  ) {
    onMarkdownCodeBlockCopy?.(payload)
  }

  function emitMarkdownImageContextMenu(
    payload: CwChatMessageMarkdownImageContextMenuPayload,
  ) {
    onMarkdownImageContextMenu?.(payload)
  }

  function onInlineAttachmentsMetaClick() {
    if ((message.inlineAttachmentCount ?? 0) > 0) {
      onInlineAttachmentsOpen?.(message)
    }
  }

  function onForwardBundleOpenHandler(m: ChatMessage) {
    onForwardBundleOpen?.(m)
  }

  function handleKeyAction(
    action: () => void,
  ): (event: ReactKeyboardEvent<HTMLElement>) => void {
    return (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      action()
    }
  }

  const bubblesHandlers = {
    onQuoteNavigate,
    onForwardBundleOpen: onForwardBundleOpenHandler,
    onAttachmentPreviewOpen: emitAttachmentPreviewOpen,
    onOpenPath,
    onMarkdownCodeBlockCopy: emitMarkdownCodeBlockCopy,
    onMarkdownImageContextMenu: emitMarkdownImageContextMenu,
    onMentionProfileClick,
  } as const

  const bubblesCommonProps = {
    message,
    downloadByUrl,
    fileDownloadProgressResolver,
    revealLocalFile,
    mediaBubbleMaxSide,
    bubblesFullWidth,
    peerBubbleAppearance,
    layoutVariant,
    mentionLabelResolver,
    mentionProfileResolver,
    mentionAvatarFallbackSrc,
    mentionProfileClickable: !interactionsDisabled,
    walletRedEnvelopeIconSrc,
    walletRedEnvelopeTexts,
    walletTransferTexts,
    forwardBundleTexts,
    viewerUserId,
    walletTransferProfileResolver,
    conversationIsMultiParty: showPeerSenderInMultiParty,
    ...bubblesHandlers,
  }

  const metaNode = (nodeClassName: string): ReactNode => (
    <div className={nodeClassName}>
      {(message.inlineAttachmentCount ?? 0) > 0 ? (
        <div
          role="button"
          tabIndex={0}
          className={messageCellBase.inlineAttachmentMetaBtn}
          title={`${message.inlineAttachmentCount} 个附件，点击查看`}
          aria-label="查看本条消息附件列表"
          onClick={(event) => {
            event.stopPropagation()
            onInlineAttachmentsMetaClick()
          }}
          onKeyDown={handleKeyAction(onInlineAttachmentsMetaClick)}
        >
          <CwIcon
            aria-hidden="true"
            name="common--action--link-line"
            prefix="icon"
            size={0.875}
            className="inline-flex shrink-0 text-current"
          />
          <span className={inlineAttachmentCountClass}>
            {message.inlineAttachmentCount}
          </span>
        </div>
      ) : null}
      {!hideFooterTime && message.timeLabel ? (
        <span>{message.timeLabel}</span>
      ) : null}
      {!hideFooterTime &&
      message.clientTimeLabel &&
      message.clientTimeLabel.length > 0 ? (
        <span className="ml-1 opacity-70">
          {texts.clientTimeLocalPrefix}
          {message.clientTimeLabel}
          {texts.clientTimeLocalSuffix}
        </span>
      ) : null}
    </div>
  )

  const assistantActionsNode = showAssistantActionsForMessage ? (
    <CwChatMessageCellAssistantActions
      className={llmContextMetaLabel ? '!pt-1' : undefined}
      message={message}
      disabled={assistantActionsDisabledForMessage}
      revealOnHover={assistantActionsRevealOnHover === true}
      feedbackVote={assistantFeedbackVoteForMessage}
      speechPlaying={assistantSpeechPlayingForMessage}
      shareSlot={assistantShareSlot?.({ message })}
      onSpeech={onAssistantActionSpeech}
      onCopy={onAssistantActionCopy}
      onFeedback={onAssistantActionFeedback}
    />
  ) : null

  return (
    <div
      {...rest}
      className={[
        messageCellBase.row,
        message.isOwn && !isWorkspaceLayout ? 'items-end' : 'items-start',
        isWorkspaceLayout && !message.isOwn ? 'px-2' : '',
        'group/msg',
        assistantFooterHot ? 'is-asst-footer-hot' : '',
        interactionsDisabled
          ? 'pointer-events-none [&_*]:pointer-events-none'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerMove={(event) => {
        onAssistantFooterPointerMove(event)
        onPointerMove?.(event)
      }}
      onPointerLeave={(event) => {
        onAssistantFooterPointerLeave()
        onPointerLeave?.(event)
      }}
      onPointerCancel={(event) => {
        onAssistantFooterPointerLeave()
        onPointerCancel?.(event)
      }}
    >
      {showPeerHeader ? (
        <div className="flex w-full max-w-full flex-row items-start gap-2">
          {!hidePeerAvatarColumn ? (
            <div
              role={peerAvatarOpensProfile ? 'button' : undefined}
              tabIndex={peerAvatarOpensProfile ? 0 : undefined}
              data-cw-peer-avatar=""
              className={[
                'mt-0.5 shrink-0 rounded-[var(--radius-default)] border-0 bg-transparent p-0 outline-none',
                peerAvatarOpensProfile
                  ? 'cursor-pointer focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-0'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={
                peerAvatarOpensProfile ? peerSenderProfileAriaLabel : undefined
              }
              onClick={(event) => {
                event.stopPropagation()
                if (peerAvatarOpensProfile) onPeerSenderHeaderClick()
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                if (peerAvatarOpensProfile) onPeerSenderHeaderClick()
              }}
            >
              <CwAvatar
                src={message.sender.avatar}
                {...CW_CHAT_AVATAR_PROPS}
                fallbackSrc={peerAvatarFallbackSrc}
                text={message.sender.name}
                size={2.25}
              />
            </div>
          ) : null}
          <div
            className={[
              'flex min-w-0 max-w-full flex-col gap-1 overflow-hidden',
              hidePeerAvatarColumn ? 'w-full min-w-0' : 'min-w-0 flex-1',
            ].join(' ')}
          >
            {peerSenderNameClickable ? (
              <button
                type="button"
                data-cw-peer-avatar=""
                className={[
                  'inline-flex max-w-full items-center gap-0.5 truncate border-0 bg-transparent p-0 text-left outline-none hover:text-[var(--text-color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-0',
                  peerSenderNameClass,
                ].join(' ')}
                aria-expanded={
                  peerSenderHeaderCollapseMode ? !collapsed : undefined
                }
                aria-label={peerSenderNameAriaLabel}
                onClick={(event) => {
                  event.stopPropagation()
                  onPeerSenderHeaderClick()
                }}
              >
                <span className="truncate">{message.sender.name}</span>
                {peerSenderHeaderCollapseMode ? (
                  <CwIcon
                    name={
                      collapsed
                        ? 'common--dir--arrow-right-line'
                        : 'common--dir--arrow-down-line'
                    }
                    prefix="icon"
                    size={0.875}
                    className="inline-flex shrink-0 text-[var(--text-color-placeholder)]"
                  />
                ) : null}
              </button>
            ) : (
              <span className={['max-w-full truncate text-left', peerSenderNameClass].join(' ')}>
                {message.sender.name}
              </span>
            )}
            {!collapsed ? (
              <>
                <CwChatMessageCellBubbles
                  {...bubblesCommonProps}
                  onClick={emitClick}
                />
                {llmContextMetaLabel ? (
                  <div className={llmContextRowClasses}>{llmContextMetaLabel}</div>
                ) : null}
                {assistantActionsNode}
                {showMeta ? metaNode(metaPeerClasses) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : message.isOwn ? (
        <div
          className={[
            'flex w-full max-w-full flex-col gap-1',
            isWorkspaceLayout ? 'items-stretch' : 'items-end',
          ].join(' ')}
        >
          {/* 发送态/失败态/重试态在气泡左侧（文档流），与微信一致 */}
          <div
            className={[
              'flex w-full max-w-full min-w-0',
              isWorkspaceLayout ? 'justify-start' : 'justify-end',
            ].join(' ')}
          >
            <div
              className={[
                ownBubbleColumnClass,
                'flex min-w-0 max-w-full flex-col gap-1',
                isWorkspaceLayout ? 'items-stretch' : 'items-end',
              ].join(' ')}
            >
              {message.quotePreview ? (
                <div
                  className={[
                    CHAT_CARD_BUBBLE_WRAPPER_CLASS,
                    isWorkspaceLayout ? 'justify-start' : 'ml-auto justify-end',
                  ].join(' ')}
                  style={ownQuoteBubbleWrapperMaxWidthStyle}
                >
                  <CwChatMessageQuote
                    preview={message.quotePreview}
                    navigable={
                      !!message.replyToMessageId && !message.quotePreview.missing
                    }
                    className={CHAT_CARD_BUBBLE_BODY_INNER_CLASS}
                    onNavigate={onOwnQuoteNavigate}
                  />
                </div>
              ) : null}
              <div className={ownOutboundRowClass}>
                {showOwnOutboundStatus ? (
                  <div
                    className={[
                      messageCellBase.ownOutboundStatusSlot,
                      message.status === 'failed' ||
                      message.agentProxyRetryable ||
                      ownOutboundSendFailed ||
                      ownOutboundFailedReadonly
                        ? 'pointer-events-auto'
                        : 'pointer-events-none',
                    ].join(' ')}
                    role={statusRole}
                    aria-label={ownOutboundAriaLabel}
                  >
                    {showSideSendingSpinner ? (
                      <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center">
                        <CwLoading type="spinner" size="small" />
                      </div>
                    ) : message.agentProxyRetryable ? (
                      <CwTooltip
                        content={
                          message.agentProxyError || texts.agentProxyFailedHint
                        }
                        placement="left"
                        showDelay={500}
                        appearance="inline"
                        className="inline-flex w-auto max-w-none shrink-0 items-center justify-center"
                        triggerSlot={
                          <div
                            role="button"
                            tabIndex={0}
                            className={ownOutboundStatusIconButtonClass}
                            aria-label={texts.retryAgentProxyLabel}
                            onClick={(event) => {
                              event.stopPropagation()
                              onRetryAgentProxy?.(message)
                            }}
                            onKeyDown={handleKeyAction(() =>
                              onRetryAgentProxy?.(message),
                            )}
                          >
                            <CwIcon
                              name="chat--msg--retry-line"
                              prefix="icon"
                              size={1.125}
                              className="inline-flex items-center justify-center"
                            />
                          </div>
                        }
                      />
                    ) : ownOutboundSendFailed ? (
                      <CwTooltip
                        content={
                          message.outboundError || texts.outboundFailedHint
                        }
                        placement="left"
                        showDelay={500}
                        appearance="inline"
                        className="inline-flex w-auto max-w-none shrink-0 items-center justify-center"
                        triggerSlot={
                          <div
                            role="button"
                            tabIndex={0}
                            className={ownOutboundStatusIconButtonClass}
                            aria-label={texts.retryOutboundLabel}
                            onClick={(event) => {
                              event.stopPropagation()
                              onRetryOutbound?.(message)
                            }}
                            onKeyDown={handleKeyAction(() =>
                              onRetryOutbound?.(message),
                            )}
                          >
                            <CwIcon
                              name="common--status--info-filled"
                              prefix="icon"
                              size={1.125}
                              className="inline-flex items-center justify-center"
                            />
                          </div>
                        }
                      />
                    ) : ownOutboundFailedReadonly ? (
                      <CwTooltip
                        content={message.outboundError || texts.sendFailedLabel}
                        placement="left"
                        showDelay={500}
                        appearance="inline"
                        className="inline-flex w-auto max-w-none shrink-0 items-center justify-center"
                        triggerSlot={
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-[var(--error-color-6)]">
                            <CwIcon
                              name="common--status--info-filled"
                              prefix="icon"
                              size={1.125}
                              className="inline-flex items-center justify-center"
                              texts={{ label: texts.sendFailedLabel }}
                            />
                          </span>
                        }
                      />
                    ) : null}
                  </div>
                ) : null}
                <div
                  className={[
                    'relative min-w-0',
                    !!message.isOwn &&
                      !ownMessageEditing &&
                      isWorkspaceLayout &&
                      'group/own-bubble',
                    isWorkspaceLayout ? 'flex-1' : 'w-fit max-w-full shrink-0',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {ownMessageEditing ? (
                    <CwChatMessageOwnEdit
                      initialHtml={message.content ?? ''}
                      mentionItems={mentionItems}
                      mentionAvatarFallbackSrc={ownEditMentionAvatarFallbackSrc}
                      onSubmit={handleOwnMessageEditSubmit}
                      onCancel={handleOwnMessageEditCancel}
                    />
                  ) : isWorkspaceLayout ? (
                    <div className={workspaceOwnChromeClass}>
                      <div className={workspaceOwnChromeBodyClass}>
                        <CwChatMessageCellBubbles
                          {...bubblesCommonProps}
                          hugStackWidth={ownHugStackWidth}
                          hideQuotePreview={!!message.quotePreview}
                          embedInOwnChrome
                          onClick={onOwnBubblesClick}
                        />
                      </div>
                      <div
                        className={[
                          workspaceOwnActionRailClass,
                          canStopOwnMessage
                            ? 'items-center'
                            : 'items-end pb-2.5',
                        ].join(' ')}
                      >
                        {canStopOwnMessage ? (
                          <button
                            type="button"
                            className={ownBubbleStopActionClass}
                            aria-label={texts.stopOwnMessageReplyLabel}
                            onClick={(event) => {
                              event.stopPropagation()
                              onOwnMessageStop()
                            }}
                          >
                            <CwIcon
                              name="common--status--stop-filled"
                              prefix="icon"
                              size={OWN_MESSAGE_STOP_ICON_SIZE}
                            />
                          </button>
                        ) : workspaceOwnRetryUrgent ? (
                          <div
                            role="button"
                            tabIndex={0}
                            className={[
                              ownBubbleRetryActionClass,
                              ownBubbleRetryUrgentClass,
                            ].join(' ')}
                            aria-label={workspaceOwnRetryAriaLabel}
                            onClick={(event) => {
                              event.stopPropagation()
                              onWorkspaceOwnRetry()
                            }}
                            onKeyDown={handleKeyAction(onWorkspaceOwnRetry)}
                          >
                            <CwIcon
                              name="chat--msg--retry-line"
                              prefix="icon"
                              size={OWN_MESSAGE_RETRY_ICON_SIZE}
                            />
                          </div>
                        ) : ownSideActionSlot ? (
                          ownSideActionSlot({ message })
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            className={ownBubbleRetryActionClass}
                            aria-label={workspaceOwnRetryAriaLabel}
                            onClick={(event) => {
                              event.stopPropagation()
                              onWorkspaceOwnRetry()
                            }}
                            onKeyDown={handleKeyAction(onWorkspaceOwnRetry)}
                          >
                            <CwIcon
                              name="chat--msg--retry-line"
                              prefix="icon"
                              size={OWN_MESSAGE_RETRY_ICON_SIZE}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <CwChatMessageCellBubbles
                      {...bubblesCommonProps}
                      hugStackWidth={ownHugStackWidth}
                      hideQuotePreview={!!message.quotePreview}
                      ownSideActionSlot={
                        ownSideActionSlot && !suppressOwnSideAction
                          ? ownSideActionSlot
                          : undefined
                      }
                      onClick={onOwnBubblesClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={[
              'flex w-full min-w-0 flex-col gap-1',
              isWorkspaceLayout ? 'items-start' : 'items-end',
            ].join(' ')}
          >
            {showMeta ? metaNode(metaOwnClasses) : null}
          </div>
        </div>
      ) : (
        <>
          <CwChatMessageCellBubbles
            {...bubblesCommonProps}
            onClick={emitClick}
          />
          {llmContextMetaLabel ? (
            <div className={llmContextRowClasses}>{llmContextMetaLabel}</div>
          ) : null}
          {assistantActionsNode}
          {showMeta ? metaNode(metaPeerClasses) : null}
        </>
      )}
    </div>
  )
}

export default CwChatMessageCell
