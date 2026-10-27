import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ClipboardEvent } from 'react'
import {
  isImRichHtmlContent,
  parseImRichContentHtml,
  resolveImMentionDisplayLabel,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { writeBubbleSelectionClipboard } from '@zengchaowu/shared/functions/im/imBubbleSelectionClipboard'
import { buildInlineAttachmentPreviewItems, resolveInlineAttachmentPreviewIndex } from './chatInlineContentClip'
import { splitTextToEmojiParts, getEmojionePngUrl } from '../../utils/emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import CwViewportImg from '../CwViewportImg/CwViewportImg'
import CwChatInlineContentClip from './CwChatInlineContentClip'
import CwChatMentionInlineClip from './CwChatMentionInlineClip'
import {
  CHAT_MESSAGE_EMOJI_VIEWPORT_ROOT_MARGIN,
  READONLY_BUBBLE_EMOJI_GLYPH_CLASS,
  READONLY_BUBBLE_EMOJI_OVERLAY_IMG_CLASS,
  READONLY_BUBBLE_EMOJI_WRAP_CLASS,
} from './chipStyles'
import { CHAT_BUBBLE_MAX_WIDTH_CLASS } from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageBubbleLayout'
import { chatMessageOwnLeadingActionClass } from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageOwnLeadingAction'
import {
  chatBubbleTextContentClasses,
  chatBubbleTextSelectionClasses,
  resolveChatBubbleContentPaddingClass,
  resolveChatBubbleTextShellClasses,
  resolveChatOwnBubbleBodyClasses,
  resolveChatPeerBubbleBodyClasses,
} from './chatMessageBubbleSurface'
import type { CwChatMessageTextProps } from './messageParts.types'
import type {
  CwImMentionProfile,
  CwImMentionProfileClickPayload,
} from './mentionProfile.types'

export function CwChatMessageText({
  content,
  chatMessageId,
  showOnRight,
  bubblesFullWidth = false,
  mentionLabelResolver,
  mentionProfileResolver,
  mentionAvatarFallbackSrc,
  mentionProfileClickable = true,
  bubbleAppearance,
  leadingSlot,
  onClick,
  onAttachmentPreviewOpen,
  onMentionProfileClick,
}: CwChatMessageTextProps) {
  const alignEnd = !!showOnRight && !bubbleAppearance?.outlined
  const showOwnLeadingAction = alignEnd && leadingSlot !== undefined

  const leadingRef = useRef<HTMLDivElement | null>(null)
  const [hasLeadingContent, setHasLeadingContent] = useState(false)
  useLayoutEffect(() => {
    setHasLeadingContent((leadingRef.current?.childElementCount ?? 0) > 0)
  })

  const ownLeadingGutterClass =
    hasLeadingContent && bubblesFullWidth ? 'max-md:pl-8' : ''

  const bubbleBodyClasses =
    bubbleAppearance?.outlined || showOnRight
      ? resolveChatOwnBubbleBodyClasses(bubbleAppearance)
      : resolveChatPeerBubbleBodyClasses(bubbleAppearance)

  const bubbleShellClasses = resolveChatBubbleTextShellClasses(bubbleAppearance)
  const contentPaddingClass = resolveChatBubbleContentPaddingClass(bubbleAppearance)

  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  function emojiPartsForText(text: string) {
    return splitTextToEmojiParts(text, publicAssetBaseUrl)
  }

  function emojiUrl(glyph: string) {
    return getEmojionePngUrl(glyph, publicAssetBaseUrl) || ''
  }

  const segments = useMemo(
    () => parseImRichContentHtml(content ?? ''),
    [content],
  )

  const inlineAttachmentPreviewItems = useMemo(
    () => buildInlineAttachmentPreviewItems(segments),
    [segments],
  )

  const mentionTooltipEnabled = Boolean(mentionAvatarFallbackSrc?.trim())

  function displayMentionLabel(userId: string, embeddedLabel?: string) {
    return resolveImMentionDisplayLabel(
      userId,
      embeddedLabel,
      mentionLabelResolver?.(userId),
    )
  }

  function resolveMentionProfile(
    userId: string,
    embeddedLabel?: string,
  ): CwImMentionProfile {
    const fromResolver = mentionProfileResolver?.(userId)
    const label = resolveImMentionDisplayLabel(
      userId,
      embeddedLabel,
      fromResolver?.label ?? mentionLabelResolver?.(userId),
    )
    const avatar = fromResolver?.avatar?.trim()
    return {
      label,
      ...(avatar ? { avatar } : {}),
    }
  }

  function handleMentionProfileClick(payload: CwImMentionProfileClickPayload) {
    onMentionProfileClick?.(payload)
  }

  function onInlineImageClipPreview(url: string) {
    const items = inlineAttachmentPreviewItems
    if (items.length === 0) return
    onAttachmentPreviewOpen?.({
      items,
      initialIndex: resolveInlineAttachmentPreviewIndex(items, url),
    })
  }

  function onBubbleCopy(e: ClipboardEvent<HTMLSpanElement>) {
    const raw = content ?? ''
    if (!raw || !isImRichHtmlContent(raw)) return
    const target = e.currentTarget
    const sel = window.getSelection()
    if (!target || !sel?.rangeCount || !e.clipboardData) return
    const range = sel.getRangeAt(0)
    if (range.collapsed || !target.contains(range.commonAncestorContainer)) return

    const payload = writeBubbleSelectionClipboard(range.cloneContents(), {
      resolveMentionLabel: mentionLabelResolver,
      selectionRoot: target,
      selectionRanges: [range],
    })
    if (!payload) return

    e.preventDefault()
    e.clipboardData.setData('text/html', payload.html)
    e.clipboardData.setData('text/plain', payload.plain)
  }

  return (
    <div
      className={[
        'flex min-w-0',
        alignEnd ? 'w-fit max-w-full' : 'w-full justify-start',
        ownLeadingGutterClass,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'relative min-w-0 max-w-full',
          showOwnLeadingAction ? 'group/own-bubble' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showOwnLeadingAction ? (
          <div ref={leadingRef} className={chatMessageOwnLeadingActionClass}>
            {leadingSlot}
          </div>
        ) : null}
        <div
          onClick={() => onClick?.()}
          data-chat-message-id={chatMessageId}
          data-cw-chat-message-bubble-body=""
          className={[
            alignEnd || bubblesFullWidth || bubbleAppearance?.outlined
              ? 'max-w-full'
              : CHAT_BUBBLE_MAX_WIDTH_CLASS,
            bubbleShellClasses,
            bubbleBodyClasses,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              chatBubbleTextContentClasses,
              contentPaddingClass,
              chatBubbleTextSelectionClasses,
            ]
              .filter(Boolean)
              .join(' ')}
            onCopy={onBubbleCopy}
          >
            {segments.map((seg, i) => {
              if (seg.type === 'text') {
                return (
                  <span key={i}>
                    {emojiPartsForText(seg.text).map((part, j) =>
                      part.type === 'text' ? (
                        <span key={`${i}-${j}`}>{part.text}</span>
                      ) : (
                        <span
                          key={`${i}-${j}`}
                          data-emoji={part.emoji}
                          className={READONLY_BUBBLE_EMOJI_WRAP_CLASS}
                        >
                          <span
                            className={READONLY_BUBBLE_EMOJI_GLYPH_CLASS}
                            aria-hidden="true"
                          >
                            {part.emoji}
                          </span>
                          <CwViewportImg
                            src={part.src}
                            alt={part.emoji}
                            data-emoji={part.emoji}
                            className={READONLY_BUBBLE_EMOJI_OVERLAY_IMG_CLASS}
                            loadWhenVisibleRootMargin={
                              CHAT_MESSAGE_EMOJI_VIEWPORT_ROOT_MARGIN
                            }
                          />
                        </span>
                      ),
                    )}
                  </span>
                )
              }
              if (seg.type === 'emoji') {
                return (
                  <span
                    key={i}
                    data-emoji={seg.glyph}
                    className={READONLY_BUBBLE_EMOJI_WRAP_CLASS}
                  >
                    <span
                      className={READONLY_BUBBLE_EMOJI_GLYPH_CLASS}
                      aria-hidden="true"
                    >
                      {seg.glyph}
                    </span>
                    <CwViewportImg
                      src={seg.src?.trim() || emojiUrl(seg.glyph)}
                      alt={seg.glyph}
                      data-emoji={seg.glyph}
                      className={READONLY_BUBBLE_EMOJI_OVERLAY_IMG_CLASS}
                      loadWhenVisibleRootMargin={
                        CHAT_MESSAGE_EMOJI_VIEWPORT_ROOT_MARGIN
                      }
                    />
                  </span>
                )
              }
              if (seg.type === 'mention') {
                const profile = resolveMentionProfile(seg.userId, seg.label)
                return (
                  <CwChatMentionInlineClip
                    key={i}
                    userId={seg.userId}
                    label={displayMentionLabel(seg.userId, seg.label)}
                    tooltipEnabled={mentionTooltipEnabled}
                    avatar={profile.avatar}
                    avatarFallbackSrc={mentionAvatarFallbackSrc}
                    profileClickable={mentionProfileClickable}
                    onProfileClick={handleMentionProfileClick}
                  />
                )
              }
              if (seg.type === 'file') {
                return (
                  <CwChatInlineContentClip
                    key={i}
                    kind="file"
                    value={seg.path}
                  />
                )
              }
              if (seg.type === 'image' && seg.url) {
                return (
                  <CwChatInlineContentClip
                    key={i}
                    kind="image"
                    value={seg.url}
                    intrinsicWidth={seg.width}
                    intrinsicHeight={seg.height}
                    onPreview={onInlineImageClipPreview}
                  />
                )
              }
              return null
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CwChatMessageText
