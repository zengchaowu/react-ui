import type { ReactNode } from 'react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import type { ImFormattedDisplayBlock } from '@zengchaowu/shared/types/im-message-display'
import { IM_AGENT_TOOL_BLOCK_TYPE } from '@zengchaowu/shared/functions/ai/aiReplyStreamDisplay'
import {
  groupImDisplayBlocksForRender,
  type ImDisplayRenderSegment,
} from '@zengchaowu/shared/functions/ai/groupImDisplayBlocksForRender'
import { findFileChangeForToolCall } from '@zengchaowu/shared/functions/im/imFileChanges'
import type {
  CwMarkdownCodeBlockCopyPayload,
  CwMarkdownImageContextMenuPayload,
} from '../CwMarkdown/types'
import CwChatMessageQuote from '../CwChatMessageQuote/CwChatMessageQuote'
import CwChatMessageForwardBundle from '../CwChatMessageForwardBundle/CwChatMessageForwardBundle'
import CwChatThoughtBlock from '../CwChatThoughtBlock/CwChatThoughtBlock'
import CwChatWorkedBlock from '../CwChatWorkedBlock/CwChatWorkedBlock'
import CwChatActivityItems from '../CwChatActivityItems/CwChatActivityItems'
import CwAgentToolShimmerLabel from '../CwChatAgentToolStep/CwAgentToolShimmerLabel'
import CwChatMessageText from './CwChatMessageText'
import CwChatMessageMarkdown from './CwChatMessageMarkdown'
import CwChatMessageImage from './CwChatMessageImage'
import CwChatMessageSticker from './CwChatMessageSticker'
import CwChatMessageTransfer from './CwChatMessageTransfer'
import CwChatMessageRedEnvelope from './CwChatMessageRedEnvelope'
import CwChatMessageVideo from './CwChatMessageVideo'
import CwChatMessageFile from './CwChatMessageFile'
import CwChatMessageVoice from './CwChatMessageVoice'
import {
  CHAT_CARD_BUBBLE_BODY_INNER_CLASS,
  CHAT_CARD_BUBBLE_WRAPPER_CLASS,
  chatCardBubbleWrapperMaxWidthStyle,
} from './chatMessageBubbleLayout'
import {
  CW_AI_ASSISTANT_BUBBLE_APPEARANCE,
  CW_WORKSPACE_OWN_BUBBLE_APPEARANCE,
  type CwChatMessageBubbleAppearance,
} from './chatMessageBubbleSurface'
import { chatAiDisplaySegmentStackClass } from './chatMessageTypography'
import type {
  CwChatAttachmentPreviewOpenPayload,
  CwChatDownloadByUrlFn,
  CwChatFileDownloadProgressResolver,
  CwChatMessageLayoutVariant,
  CwChatRevealLocalFileFn,
} from './types'
import type { CwChatMessageForwardBundleTexts } from '../CwChatMessageForwardBundle/types'
import type { CwChatMessageRedEnvelopeTexts } from './redEnvelopeTexts'
import type { CwChatMessageTransferTexts } from './transferTexts'
import type {
  CwImMentionProfileClickPayload,
  CwImMentionProfileResolver,
} from './mentionProfile.types'

const cardBubbleWrapperMaxWidthStyle = chatCardBubbleWrapperMaxWidthStyle()

export interface CwChatMessageCellBubblesProps {
  message: ChatMessage
  downloadByUrl: CwChatDownloadByUrlFn
  fileDownloadProgressResolver?: CwChatFileDownloadProgressResolver
  revealLocalFile?: CwChatRevealLocalFileFn
  mediaBubbleMaxSide?: number
  mentionLabelResolver?: (userId: string) => string
  mentionProfileResolver?: CwImMentionProfileResolver
  mentionAvatarFallbackSrc?: string
  mentionProfileClickable?: boolean
  /** 为 true 时文本/Markdown 气泡（含对方消息）不再使用 max-w 80%/66% */
  bubblesFullWidth?: boolean
  /**
   * 为 true 时多块栈按最宽气泡收缩宽度（`w-max`），不设 `w-full`。
   * 己方消息旁 absolute 发送态需相对真实气泡外沿定位时使用。
   */
  hugStackWidth?: boolean
  /** 己方引用块已在 Cell 层单独渲染时，避免重复展示 */
  hideQuotePreview?: boolean
  /** 对方文本/Markdown 气泡外观（如 AI 助手） */
  peerBubbleAppearance?: CwChatMessageBubbleAppearance
  /** `workspace`：己方消息左对齐、透明描边全宽 */
  layoutVariant?: CwChatMessageLayoutVariant
  /**
   * workspace 己方：描边壳由 Cell 外层承担时，气泡本体不再自带描边/底色（仅正文）。
   */
  embedInOwnChrome?: boolean
  /** 红包领取中（message id → true） */
  redEnvelopeClaiming?: boolean
  /** 红包气泡内图标 URL（由宿主应用提供本地资源） */
  walletRedEnvelopeIconSrc?: string
  walletRedEnvelopeTexts?: Partial<CwChatMessageRedEnvelopeTexts>
  walletTransferTexts?: Partial<CwChatMessageTransferTexts>
  forwardBundleTexts?: Partial<CwChatMessageForwardBundleTexts>
  /** 当前查看者 userId（用于展示「我已领取」金额等） */
  viewerUserId?: string
  /** 转账气泡收款方昵称解析 */
  walletTransferProfileResolver?: (userId: string) => { name: string } | undefined
  /** 成员数 > 2 的多人会话（转账己方标题展示收款方） */
  conversationIsMultiParty?: boolean
  /** 具名插槽 `ownSideAction`（作用域插槽） */
  ownSideActionSlot?: (scope: { message: ChatMessage }) => ReactNode
  /** 等价 Vue `@click` */
  onClick?: (message: ChatMessage) => void
  /** 等价 Vue `@quote-navigate` */
  onQuoteNavigate?: (messageId: string) => void
  /** 等价 Vue `@forward-bundle-open` */
  onForwardBundleOpen?: (message: ChatMessage) => void
  /** 等价 Vue `@attachment-preview-open` */
  onAttachmentPreviewOpen?: (payload: CwChatAttachmentPreviewOpenPayload) => void
  /** 等价 Vue `@open-path` */
  onOpenPath?: (path: string) => void
  /** 等价 Vue `@markdown-code-block-copy` */
  onMarkdownCodeBlockCopy?: (
    payload: CwMarkdownCodeBlockCopyPayload & { message: ChatMessage },
  ) => void
  /** 等价 Vue `@markdown-image-context-menu` */
  onMarkdownImageContextMenu?: (
    payload: CwMarkdownImageContextMenuPayload & { message: ChatMessage },
  ) => void
  /** 等价 Vue `@mention-profile-click` */
  onMentionProfileClick?: (payload: CwImMentionProfileClickPayload) => void
}

function propNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
    return Math.floor(v)
  }
  return undefined
}

function aiStreamTailLoading(m: ChatMessage): boolean {
  return String(m.id).startsWith('ai_stream_') && m.status === 'sending'
}

function isAgentToolRenderSegment(segment: ImDisplayRenderSegment): boolean {
  return segment.kind === 'worked' || segment.kind === 'thought'
}

function aiStreamTailLoadingForMarkdownSegment(
  m: ChatMessage,
  segments: ImDisplayRenderSegment[],
  segmentIndex: number,
): boolean {
  if (!aiStreamTailLoading(m)) return false
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const segment = segments[i]
    if (!segment) continue
    if (isAgentToolRenderSegment(segment)) return false
    if (segment.kind === 'block' && segment.block.type === 'im.markdown') {
      return i === segmentIndex
    }
  }
  return segmentIndex === segments.length - 1
}

function fileBlockMeta(b: ImFormattedDisplayBlock): string {
  // 优先使用原始文件名，其次从下载 URL 解析
  const name =
    typeof b.props.originalFileName === 'string'
      ? b.props.originalFileName.trim()
      : ''
  if (name) return name
  const url = String(b.props.downloadUrl ?? '').trim()
  if (url && /^https?:\/\//i.test(url)) {
    try {
      const path = new URL(url).pathname
      const seg = path.split('/').filter(Boolean).pop()
      if (seg) return decodeURIComponent(seg)
    } catch {
      // ignore
    }
  }
  return url || '文件'
}

export function CwChatMessageCellBubbles({
  message,
  downloadByUrl,
  fileDownloadProgressResolver,
  revealLocalFile,
  mediaBubbleMaxSide,
  mentionLabelResolver,
  mentionProfileResolver,
  mentionAvatarFallbackSrc,
  mentionProfileClickable,
  bubblesFullWidth = false,
  hugStackWidth = false,
  hideQuotePreview = false,
  peerBubbleAppearance,
  layoutVariant = 'default',
  embedInOwnChrome = false,
  redEnvelopeClaiming = false,
  walletRedEnvelopeIconSrc,
  walletRedEnvelopeTexts,
  walletTransferTexts,
  forwardBundleTexts,
  viewerUserId,
  walletTransferProfileResolver,
  conversationIsMultiParty,
  ownSideActionSlot,
  onClick,
  onQuoteNavigate,
  onForwardBundleOpen,
  onAttachmentPreviewOpen,
  onOpenPath,
  onMarkdownCodeBlockCopy,
  onMarkdownImageContextMenu,
  onMentionProfileClick,
}: CwChatMessageCellBubblesProps) {
  /** FileChange 通过 fileChanges join before/after */
  const displayBlocks = (message.displaySpec?.blocks ?? []) as ImFormattedDisplayBlock[]
  const renderSegments = groupImDisplayBlocksForRender(displayBlocks)

  const showPlanningNextMoves = (() => {
    if (!aiStreamTailLoading(message)) return false
    const last = renderSegments[renderSegments.length - 1]
    if (!last || last.kind === 'block') return false
    if (last.kind === 'thought' && !last.endedAt) return false
    return renderSegments.some(
      (segment) => segment.kind === 'thought' || segment.kind === 'worked',
    )
  })()

  function reviewForStep(toolCallId: string) {
    return findFileChangeForToolCall(message.fileChanges, toolCallId)
  }

  const hasAgentToolBlock = displayBlocks.some(
    (b) => b.type === IM_AGENT_TOOL_BLOCK_TYPE || b.type === 'im.thought',
  )

  const stackRootRowClass = hasAgentToolBlock
    ? `flex w-full min-w-0 max-w-full flex-col ${chatAiDisplaySegmentStackClass}`
    : hugStackWidth
      ? 'flex w-max min-w-0 max-w-full flex-col gap-2'
      : 'flex w-full min-w-0 flex-col gap-2'

  const agentToolBlockWrapperClass = 'w-full min-w-0 max-w-full cursor-text select-text'

  const isWalletBubbleMessage =
    (message.type === 'red_envelope' && !!message.redEnvelope) ||
    (message.type === 'transfer' && !!message.walletTransfer)

  const isVoiceBubbleMessage = message.type === 'voice'

  const stackWidthClass = isVoiceBubbleMessage
    ? 'w-max max-w-full min-w-0 shrink-0'
    : isWalletBubbleMessage
      ? 'w-max shrink-0'
      : hasAgentToolBlock
        ? 'w-full min-w-0 max-w-full'
        : hugStackWidth
          ? 'w-max max-w-full'
          : 'w-full'

  const bubbleShowOnRight = !!message.isOwn && layoutVariant !== 'workspace'

  const textBubbleAppearance = (() => {
    if (!(message.isOwn && layoutVariant === 'workspace')) return undefined
    // 描边壳在 Cell：内层只保留透明正文，避免双边框
    if (embedInOwnChrome) {
      return { borderless: true, paddingless: true }
    }
    return CW_WORKSPACE_OWN_BUBBLE_APPEARANCE
  })()

  const peerMarkdownBubbleAppearance = (() => {
    if (message.isOwn) return undefined
    if (hasAgentToolBlock) {
      return {
        ...CW_AI_ASSISTANT_BUBBLE_APPEARANCE,
        ...(peerBubbleAppearance ?? {}),
        borderless: true,
        paddingless: true,
      }
    }
    return peerBubbleAppearance
  })()

  const markdownBubbleAppearance = message.isOwn
    ? textBubbleAppearance
    : peerMarkdownBubbleAppearance

  const markdownBubblesFullWidth = bubblesFullWidth || hasAgentToolBlock

  function onQuoteNavigateClick() {
    const id = message.replyToMessageId
    if (id) onQuoteNavigate?.(String(id))
  }

  function downloadProgressCellBind(messageId: string) {
    const r = fileDownloadProgressResolver?.(String(messageId))
    if (r?.isDownloading === true) {
      return {
        isDownloading: true as const,
        downloadProgress:
          typeof r.progress === 'number' && Number.isFinite(r.progress)
            ? Math.min(100, Math.max(0, r.progress))
            : undefined,
      }
    }
    return {}
  }

  function fileMessageCellBind(messageId: string) {
    const outboundSending =
      !!message.isOwn && message.status === 'sending'
    const r = fileDownloadProgressResolver?.(String(messageId))
    const localPath = r?.localFilePath?.trim()
    const localFile =
      localPath && !r?.isDownloading
        ? { localFilePath: localPath }
        : {}
    return {
      outboundSending,
      ...downloadProgressCellBind(messageId),
      ...localFile,
    }
  }

  const imageCellDisplaySrc = (() => {
    const t = message.mediaThumbnailUrl?.trim()
    if (t) return t
    return message.content?.trim() ?? ''
  })()

  const videoPosterSrc = message.mediaThumbnailUrl?.trim() ?? ''

  const fileCellFileName = (() => {
    // 优先使用原始文件名，其次从 content URL 解析
    const orig = message.mediaOriginalFileName?.trim()
    if (orig) return orig
    const c = message.content?.trim() ?? ''
    if (c && (/^https?:\/\//i.test(c) || c.startsWith('blob:'))) {
      try {
        const path = new URL(c, 'http://_').pathname
        const seg = path.split('/').filter(Boolean).pop()
        if (seg) return decodeURIComponent(seg)
      } catch {
        // ignore
      }
    }
    return orig || c || '文件'
  })()

  const fileCellDownloadUrl = (() => {
    if (message.type !== 'file') return ''
    const c = message.content?.trim() ?? ''
    if (/^https?:\/\//i.test(c) || c.startsWith('blob:')) return c
    return ''
  })()

  function emitClick() {
    onClick?.(message)
  }

  function emitForwardBundleOpen() {
    onForwardBundleOpen?.(message)
  }

  function emitAttachmentPreviewOpen(payload: CwChatAttachmentPreviewOpenPayload) {
    onAttachmentPreviewOpen?.({
      ...payload,
      chatMessageId: payload.chatMessageId ?? String(message.id),
    })
  }

  function handleMarkdownCodeBlockCopy(p: CwMarkdownCodeBlockCopyPayload) {
    onMarkdownCodeBlockCopy?.({ message, ...p })
  }

  function handleMarkdownImageContextMenu(p: CwMarkdownImageContextMenuPayload) {
    onMarkdownImageContextMenu?.({ message, ...p })
  }

  function openGalleryForImageSrc(src: string) {
    const u = src?.trim() ?? ''
    if (!u) return
    emitAttachmentPreviewOpen({
      items: [{ key: 0, src: u, alt: '' }],
      initialIndex: 0,
    })
  }

  function onPlainImageCellClick() {
    openGalleryForImageSrc(imageCellDisplaySrc)
  }

  const leadingSlot = ownSideActionSlot
    ? ownSideActionSlot({ message })
    : undefined

  const hasDisplayBlocks =
    message.type !== 'forward_bundle' && displayBlocks.length > 0

  return (
    <div
      data-cw-chat-message-bubble=""
      className={[
        'flex min-w-0 max-w-full flex-col gap-1',
        stackWidthClass,
        bubbleShowOnRight ? 'items-end' : 'items-start',
      ].join(' ')}
    >
      {message.quotePreview && !hideQuotePreview ? (
        <div
          className={[
            CHAT_CARD_BUBBLE_WRAPPER_CLASS,
            bubbleShowOnRight ? 'ml-auto justify-end' : 'justify-start',
          ].join(' ')}
          style={cardBubbleWrapperMaxWidthStyle}
        >
          <CwChatMessageQuote
            preview={message.quotePreview}
            navigable={!!message.replyToMessageId && !message.quotePreview.missing}
            className={CHAT_CARD_BUBBLE_BODY_INNER_CLASS}
            onNavigate={onQuoteNavigateClick}
          />
        </div>
      ) : null}

      {message.type === 'forward_bundle' &&
      (message.forwardBundle?.length ?? 0) > 0 ? (
        <CwChatMessageForwardBundle
          chatMessageId={String(message.id)}
          items={message.forwardBundle}
          showOnRight={bubbleShowOnRight}
          mentionLabelResolver={mentionLabelResolver}
          texts={forwardBundleTexts}
          onOpen={emitForwardBundleOpen}
        />
      ) : null}

      {hasDisplayBlocks ? (
        <div
          className={[
            stackRootRowClass,
            bubbleShowOnRight
              ? 'items-end'
              : hasAgentToolBlock
                ? 'items-stretch'
                : 'items-start',
          ].join(' ')}
        >
          {renderSegments.map((segment, idx) => {
            if (segment.kind === 'block') {
              if (segment.block.type === 'im.text') {
                return (
                  <CwChatMessageText
                    key={`im-seg-${idx}`}
                    chatMessageId={String(message.id)}
                    content={String(segment.block.props.content ?? '')}
                    showOnRight={bubbleShowOnRight}
                    bubblesFullWidth={bubblesFullWidth}
                    mentionLabelResolver={mentionLabelResolver}
                    mentionProfileResolver={mentionProfileResolver}
                    mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
                    mentionProfileClickable={mentionProfileClickable}
                    bubbleAppearance={textBubbleAppearance}
                    leadingSlot={leadingSlot}
                    onClick={emitClick}
                    onAttachmentPreviewOpen={emitAttachmentPreviewOpen}
                    onMentionProfileClick={onMentionProfileClick}
                  />
                )
              }
              if (segment.block.type === 'im.markdown') {
                return (
                  <CwChatMessageMarkdown
                    key={`im-seg-${idx}`}
                    chatMessageId={String(message.id)}
                    content={String(segment.block.props.content ?? '')}
                    showOnRight={bubbleShowOnRight}
                    bubblesFullWidth={markdownBubblesFullWidth}
                    tailLoading={aiStreamTailLoadingForMarkdownSegment(
                      message,
                      renderSegments,
                      idx,
                    )}
                    mentionLabelResolver={mentionLabelResolver}
                    bubbleAppearance={markdownBubbleAppearance}
                    onClick={emitClick}
                    onAttachmentPreviewOpen={emitAttachmentPreviewOpen}
                    onMarkdownCodeBlockCopy={handleMarkdownCodeBlockCopy}
                    onMarkdownImageContextMenu={handleMarkdownImageContextMenu}
                  />
                )
              }
              if (segment.block.type === 'im.image') {
                return (
                  <CwChatMessageImage
                    key={`im-seg-${idx}`}
                    chatMessageId={String(message.id)}
                    {...downloadProgressCellBind(String(message.id))}
                    thumbnailUrl={String(segment.block.props.thumbnailUrl ?? '')}
                    width={propNum(segment.block.props.width) ?? message.mediaWidth}
                    height={propNum(segment.block.props.height) ?? message.mediaHeight}
                    maxWidth={mediaBubbleMaxSide}
                    maxHeight={mediaBubbleMaxSide}
                    showOnRight={bubbleShowOnRight}
                    isUploading={message.mediaUploadStatus === 'uploading'}
                    uploadFailed={message.mediaUploadStatus === 'failed'}
                    uploadProgress={message.mediaUploadProgress}
                    uploadPhase={message.mediaUploadPhase}
                    onClick={() =>
                      openGalleryForImageSrc(
                        String(segment.block.props.thumbnailUrl ?? ''),
                      )
                    }
                  />
                )
              }
              if (segment.block.type === 'im.video') {
                return (
                  <CwChatMessageVideo
                    key={`im-seg-${idx}`}
                    chatMessageId={String(message.id)}
                    {...downloadProgressCellBind(String(message.id))}
                    thumbnailUrl={String(segment.block.props.thumbnailUrl ?? '')}
                    videoUrl={String(segment.block.props.videoUrl ?? '')}
                    width={propNum(segment.block.props.width) ?? message.mediaWidth}
                    height={propNum(segment.block.props.height) ?? message.mediaHeight}
                    maxWidth={mediaBubbleMaxSide}
                    maxHeight={mediaBubbleMaxSide}
                    showOnRight={bubbleShowOnRight}
                    isUploading={message.mediaUploadStatus === 'uploading'}
                    uploadFailed={message.mediaUploadStatus === 'failed'}
                    uploadProgress={message.mediaUploadProgress}
                    uploadPhase={message.mediaUploadPhase}
                    onClick={emitClick}
                  />
                )
              }
              if (segment.block.type === 'im.file') {
                return (
                  <CwChatMessageFile
                    key={`im-seg-${idx}`}
                    chatMessageId={String(message.id)}
                    downloadByUrl={downloadByUrl}
                    revealLocalFile={revealLocalFile}
                    {...fileMessageCellBind(String(message.id))}
                    fileName={fileBlockMeta(segment.block)}
                    fileSizeBytes={propNum(segment.block.props.fileSizeBytes)}
                    downloadUrl={String(segment.block.props.downloadUrl ?? '')}
                    showOnRight={bubbleShowOnRight}
                    isUploading={message.mediaUploadStatus === 'uploading'}
                    uploadFailed={message.mediaUploadStatus === 'failed'}
                    uploadProgress={message.mediaUploadProgress}
                    uploadPhase={message.mediaUploadPhase}
                    onClick={emitClick}
                  />
                )
              }
              return null
            }
            if (segment.kind === 'thought') {
              return (
                <div
                  key={`im-seg-${idx}`}
                  className={agentToolBlockWrapperClass}
                  data-cw-chat-thought-section=""
                >
                  <CwChatThoughtBlock
                    chatMessageId={String(message.id)}
                    content={segment.content}
                    startedAt={segment.startedAt}
                    endedAt={segment.endedAt}
                  />
                  {segment.items.length ? (
                    <CwChatActivityItems
                      chatMessageId={String(message.id)}
                      items={segment.items}
                      reviewForStep={reviewForStep}
                      onOpenPath={onOpenPath}
                    />
                  ) : null}
                </div>
              )
            }
            return (
              <CwChatWorkedBlock
                key={`im-seg-${idx}`}
                className={agentToolBlockWrapperClass}
                chatMessageId={String(message.id)}
                items={segment.items}
                reviewForStep={reviewForStep}
                onOpenPath={onOpenPath}
              />
            )
          })}
          {showPlanningNextMoves ? (
            <CwAgentToolShimmerLabel
              active
              className="px-0 py-1 [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]"
            >
              Planning next moves
            </CwAgentToolShimmerLabel>
          ) : null}
        </div>
      ) : message.type === 'markdown' ? (
        <CwChatMessageMarkdown
          chatMessageId={String(message.id)}
          content={message.content}
          showOnRight={bubbleShowOnRight}
          bubblesFullWidth={markdownBubblesFullWidth}
          tailLoading={aiStreamTailLoading(message)}
          mentionLabelResolver={mentionLabelResolver}
          bubbleAppearance={markdownBubbleAppearance}
          onClick={emitClick}
          onAttachmentPreviewOpen={emitAttachmentPreviewOpen}
          onMarkdownCodeBlockCopy={handleMarkdownCodeBlockCopy}
          onMarkdownImageContextMenu={handleMarkdownImageContextMenu}
        />
      ) : message.type === 'text' ? (
        <CwChatMessageText
          chatMessageId={String(message.id)}
          content={message.content}
          showOnRight={bubbleShowOnRight}
          bubblesFullWidth={bubblesFullWidth}
          mentionLabelResolver={mentionLabelResolver}
          mentionProfileResolver={mentionProfileResolver}
          mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
          mentionProfileClickable={mentionProfileClickable}
          bubbleAppearance={textBubbleAppearance}
          leadingSlot={leadingSlot}
          onClick={emitClick}
          onAttachmentPreviewOpen={emitAttachmentPreviewOpen}
          onMentionProfileClick={onMentionProfileClick}
        />
      ) : message.type === 'sticker' ? (
        <CwChatMessageSticker
          chatMessageId={String(message.id)}
          imageUrl={message.content}
          stickerName={message.stickerName}
          width={message.mediaWidth}
          height={message.mediaHeight}
          showOnRight={bubbleShowOnRight}
          onClick={emitClick}
        />
      ) : message.type === 'transfer' && message.walletTransfer ? (
        <CwChatMessageTransfer
          chatMessageId={String(message.id)}
          transfer={message.walletTransfer}
          showOnRight={bubbleShowOnRight}
          isOwn={!!message.isOwn}
          transferProfileResolver={walletTransferProfileResolver}
          mentionLabelResolver={mentionLabelResolver}
          conversationIsMultiParty={conversationIsMultiParty}
          texts={walletTransferTexts}
          onClick={emitClick}
        />
      ) : message.type === 'red_envelope' && message.redEnvelope ? (
        <CwChatMessageRedEnvelope
          chatMessageId={String(message.id)}
          envelope={message.redEnvelope}
          iconSrc={walletRedEnvelopeIconSrc}
          viewerUserId={viewerUserId}
          showOnRight={bubbleShowOnRight}
          isOwn={!!message.isOwn}
          claiming={!!redEnvelopeClaiming}
          texts={walletRedEnvelopeTexts}
          onClick={emitClick}
        />
      ) : message.type === 'image' ? (
        <CwChatMessageImage
          chatMessageId={String(message.id)}
          {...downloadProgressCellBind(String(message.id))}
          thumbnailUrl={imageCellDisplaySrc}
          width={message.mediaWidth}
          height={message.mediaHeight}
          maxWidth={mediaBubbleMaxSide}
          maxHeight={mediaBubbleMaxSide}
          showOnRight={bubbleShowOnRight}
          isUploading={message.mediaUploadStatus === 'uploading'}
          uploadFailed={message.mediaUploadStatus === 'failed'}
          uploadProgress={message.mediaUploadProgress}
          uploadPhase={message.mediaUploadPhase}
          onClick={onPlainImageCellClick}
        />
      ) : message.type === 'video' ? (
        <CwChatMessageVideo
          chatMessageId={String(message.id)}
          {...downloadProgressCellBind(String(message.id))}
          thumbnailUrl={videoPosterSrc}
          videoUrl={message.content}
          width={message.mediaWidth}
          height={message.mediaHeight}
          maxWidth={mediaBubbleMaxSide}
          maxHeight={mediaBubbleMaxSide}
          showOnRight={bubbleShowOnRight}
          isUploading={message.mediaUploadStatus === 'uploading'}
          uploadFailed={message.mediaUploadStatus === 'failed'}
          uploadProgress={message.mediaUploadProgress}
          uploadPhase={message.mediaUploadPhase}
          onClick={emitClick}
        />
      ) : message.type === 'voice' ? (
        <CwChatMessageVoice
          chatMessageId={String(message.id)}
          audioUrl={message.content}
          durationSec={message.voiceDurationSec}
          transcript={message.voiceTranscript}
          showOnRight={bubbleShowOnRight}
          isUploading={message.mediaUploadStatus === 'uploading'}
          uploadFailed={message.mediaUploadStatus === 'failed'}
          leadingSlot={leadingSlot}
          onClick={emitClick}
        />
      ) : message.type === 'file' ? (
        <CwChatMessageFile
          chatMessageId={String(message.id)}
          downloadByUrl={downloadByUrl}
          revealLocalFile={revealLocalFile}
          {...fileMessageCellBind(String(message.id))}
          fileName={fileCellFileName}
          fileSizeBytes={message.mediaFileSizeBytes}
          downloadUrl={fileCellDownloadUrl}
          showOnRight={bubbleShowOnRight}
          isUploading={message.mediaUploadStatus === 'uploading'}
          uploadFailed={message.mediaUploadStatus === 'failed'}
          uploadProgress={message.mediaUploadProgress}
          uploadPhase={message.mediaUploadPhase}
          onClick={emitClick}
        />
      ) : message.type !== 'forward_bundle' ? (
        <CwChatMessageText
          chatMessageId={String(message.id)}
          content={message.content}
          showOnRight={bubbleShowOnRight}
          bubblesFullWidth={bubblesFullWidth}
          mentionLabelResolver={mentionLabelResolver}
          mentionProfileResolver={mentionProfileResolver}
          mentionAvatarFallbackSrc={mentionAvatarFallbackSrc}
          mentionProfileClickable={mentionProfileClickable}
          bubbleAppearance={textBubbleAppearance}
          onClick={emitClick}
          onAttachmentPreviewOpen={emitAttachmentPreviewOpen}
          onMentionProfileClick={onMentionProfileClick}
        />
      ) : null}
    </div>
  )
}

export default CwChatMessageCellBubbles
