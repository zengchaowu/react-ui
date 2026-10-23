import { useContext } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { CwMarkdown } from '../CwMarkdown/CwMarkdown'
import CwLoading from '../CwLoading/CwLoading'
import { CwMarkdownInlineImageExtensionsContext } from '../CwMarkdown/context'
import {
  collectMarkdownImageSrcsInParseOrder,
  normalizeMarkdownImageSrcForMatch,
} from '../CwMarkdown/functions'
import { useMarkdownPreprocessedContent } from '../CwMarkdown/hooks'
import { markdownBase } from '../CwMarkdown/styles'
import type {
  CwMarkdownCodeBlockCopyPayload,
  CwMarkdownImageContextMenuPayload,
} from '../CwMarkdown/types'
import type { CwChatMessageMarkdownProps } from './messageParts.types'
import { CHAT_BUBBLE_MAX_WIDTH_CLASS } from './chatMessageBubbleLayout'
import {
  isAssistantBubbleAppearance,
  resolveChatBubbleContentPaddingClass,
  resolveChatBubbleTextShellClasses,
  resolveChatOwnBubbleBodyClasses,
  resolveChatPeerBubbleBodyClasses,
} from './chatMessageBubbleSurface'
import {
  chatMessageAssistantBodyTextClass,
  chatMessageBodyTextClass,
} from './chatMessageTypography'

export function CwChatMessageMarkdown({
  content,
  chatMessageId,
  showOnRight,
  bubblesFullWidth = false,
  tailLoading = false,
  mentionLabelResolver,
  bubbleAppearance,
  onClick,
  onAttachmentPreviewOpen,
  onMarkdownCodeBlockCopy,
  onMarkdownImageContextMenu,
}: CwChatMessageMarkdownProps) {
  const displayContent = useMarkdownPreprocessedContent(content ?? '')
  const injectedInlineImageExtensions = useContext(
    CwMarkdownInlineImageExtensionsContext,
  )

  function isInlineImageExtensionSrc(src: string): boolean {
    const trimmed = src.trim()
    if (!trimmed) return false
    const node = { type: 'image' as const, src: trimmed }
    return injectedInlineImageExtensions.some((ext) => ext.match(node))
  }

  const isAssistantBubble = isAssistantBubbleAppearance(bubbleAppearance)
  const alignEnd = !!showOnRight && !bubbleAppearance?.outlined

  const bubbleTextShellClasses = resolveChatBubbleTextShellClasses(bubbleAppearance)
  const peerBubbleBodyClasses = resolveChatPeerBubbleBodyClasses(bubbleAppearance)
  const bubbleBodyClasses =
    bubbleAppearance?.outlined || showOnRight
      ? resolveChatOwnBubbleBodyClasses(bubbleAppearance)
      : peerBubbleBodyClasses

  const chatMarkdownContentTextClass = isAssistantBubble
    ? chatMessageAssistantBodyTextClass
    : chatMessageBodyTextClass

  const chatMarkdownHeading4Class = isAssistantBubble
    ? markdownBase.heading4.replace('text-base', 'text-sm')
    : undefined

  const contentPaddingClass = resolveChatBubbleContentPaddingClass(bubbleAppearance)

  function onMarkdownImageClick(
    src: string,
    ev: ReactMouseEvent<HTMLElement>,
    documentImageIndex: number,
  ) {
    ev.stopPropagation()
    const clicked = src?.trim() ?? ''
    if (!clicked) return
    const ordered = collectMarkdownImageSrcsInParseOrder(displayContent, {
      excludeSrc: isInlineImageExtensionSrc,
    })
    let items: Array<{ key: string | number; src: string; alt?: string }>
    let initialIndex = 0
    if (ordered.length > 0) {
      items = ordered.map((s, i) => ({ key: i, src: s, alt: '' }))
      if (
        Number.isFinite(documentImageIndex) &&
        documentImageIndex >= 0 &&
        documentImageIndex < ordered.length
      ) {
        initialIndex = documentImageIndex
      } else {
        const normClicked = normalizeMarkdownImageSrcForMatch(clicked)
        const idx = ordered.findIndex(
          (u) => u === clicked || normalizeMarkdownImageSrcForMatch(u) === normClicked,
        )
        initialIndex = idx >= 0 ? idx : 0
      }
    } else {
      items = [{ key: 0, src: clicked, alt: '' }]
    }
    onAttachmentPreviewOpen?.({ items, initialIndex })
  }

  function onMarkdownLinkClick(href: string, ev: ReactMouseEvent<HTMLElement>) {
    const h = href?.trim() ?? ''
    if (!h || h.startsWith('#')) return
    ev.preventDefault()
    try {
      window.open(h, '_blank', 'noopener,noreferrer')
    } catch {
      /* ignore */
    }
  }

  function handleCodeBlockCopy(payload: CwMarkdownCodeBlockCopyPayload) {
    onMarkdownCodeBlockCopy?.(payload)
  }

  function handleImageContextMenu(payload: CwMarkdownImageContextMenuPayload) {
    payload.event.stopPropagation()
    onMarkdownImageContextMenu?.(payload)
  }

  return (
    <div
      className={[
        'flex min-w-0',
        alignEnd ? 'w-fit max-w-full' : 'w-full justify-start',
      ].join(' ')}
    >
      <div
        onClick={() => onClick?.()}
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        className={[
          alignEnd || bubblesFullWidth || bubbleAppearance?.outlined
            ? 'max-w-full'
            : CHAT_BUBBLE_MAX_WIDTH_CLASS,
          bubbleTextShellClasses,
          bubbleBodyClasses,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'min-w-0 max-w-full cursor-text select-text text-left break-words [overflow-wrap:anywhere] [&_a]:break-all [&_blockquote]:min-w-0 [&_blockquote]:whitespace-pre-wrap [&_blockquote]:[overflow-wrap:anywhere] [&_blockquote]:break-normal [&_li]:min-w-0 [&_li]:whitespace-pre-wrap [&_li]:[overflow-wrap:anywhere] [&_li]:break-normal [&_p]:min-w-0 [&_p]:whitespace-pre-wrap [&_p]:[overflow-wrap:anywhere] [&_p]:break-normal',
            contentPaddingClass,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayContent.trim() ? (
            <CwMarkdown
              content={displayContent}
              mentionLabelResolver={mentionLabelResolver}
              size="medium"
              contentTextClass={chatMarkdownContentTextClass}
              heading4Class={chatMarkdownHeading4Class}
              onLinkClick={onMarkdownLinkClick}
              onImageClick={onMarkdownImageClick}
              onImageContextMenu={handleImageContextMenu}
              onCodeBlockCopy={handleCodeBlockCopy}
            />
          ) : null}
          {tailLoading ? (
            <div
              className={[
                'flex items-center text-[var(--text-color-secondary)]',
                displayContent.trim() ? 'inline-flex' : 'min-h-[1.75rem]',
              ].join(' ')}
              aria-hidden="true"
            >
              <CwLoading type="spinner" size="small" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CwChatMessageMarkdown
