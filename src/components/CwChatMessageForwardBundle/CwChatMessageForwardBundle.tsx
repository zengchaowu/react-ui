import { Fragment, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import type { ChatForwardBundleItem } from '@zengchaowu/shared/types/im-chat'
import { materializeImForwardBundlePreviewText } from '@zengchaowu/shared/functions/im/imForwardBundlePreviewText'
import {
  CW_INLINE_EMOJI_IMG_CLASS,
  splitTextToEmojiParts,
} from '../CwChatMessageQuote/emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import CwViewportImg from '../CwViewportImg/CwViewportImg'
import { chatCardBubbleWrapperMaxWidthStyle } from '../CwChatMessageCell/chatMessageBubbleLayout'
import {
  chatForwardBundleCardBodyClasses,
  chatOwnForwardBundleCardBodyClasses,
} from '../CwChatMessageCell/chatMessageBubbleSurface'
import { forwardBundleBase } from './styles'
import {
  buildCwChatMessageForwardBundleTitle,
  defaultCwChatMessageForwardBundleTexts,
} from './texts'
import type { CwChatMessageForwardBundleProps } from './types'

const PREVIEW_LINE_MAX = 4

const cardSizeStyle = chatCardBubbleWrapperMaxWidthStyle()

export function CwChatMessageForwardBundle({
  chatMessageId,
  items = [],
  showOnRight = false,
  mentionLabelResolver,
  texts: textsProp,
  onOpen,
  ...rest
}: CwChatMessageForwardBundleProps) {
  const texts = { ...defaultCwChatMessageForwardBundleTexts, ...(textsProp ?? {}) }

  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  function emojiPartsForText(text: string) {
    return splitTextToEmojiParts(text, publicAssetBaseUrl)
  }

  function uniqueSenderNames(list: readonly ChatForwardBundleItem[]): string[] {
    const seen = new Set<string>()
    const names: string[] = []
    for (const it of list) {
      const n = String(it.senderName ?? '').trim() || texts.unknownSender
      if (seen.has(n)) continue
      seen.add(n)
      names.push(n)
    }
    return names
  }

  const titleLabel = useMemo(
    () => buildCwChatMessageForwardBundleTitle(uniqueSenderNames(items), texts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, texts.unknownSender, texts.titleEmpty, texts.titleOne, texts.titleTwo, texts.titleThree, texts.titleMany],
  )

  const previewItems = items.slice(0, PREVIEW_LINE_MAX)

  function previewLine(item: ChatForwardBundleItem): string {
    const name = String(item.senderName ?? '').trim() || texts.unknownSender
    const rawBody =
      String(item.snippet ?? '').trim() ||
      item.content?.trim() ||
      texts.emptyPreviewBody
    const body = materializeImForwardBundlePreviewText(rawBody, mentionLabelResolver)
    return `${name}${texts.previewLineSeparator}${body}`
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return
    }
    event.preventDefault()
    onOpen?.()
  }

  return (
    <div
      {...rest}
      className={[
        'flex min-w-0 w-fit max-w-full',
        showOnRight ? 'ml-auto justify-end' : 'justify-start',
      ].join(' ')}
    >
      <div
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        role="button"
        tabIndex={0}
        className={[
          'overflow-hidden rounded-md relative',
          'box-border w-[var(--size-message-file-width)] min-h-0',
          showOnRight ? chatOwnForwardBundleCardBodyClasses : chatForwardBundleCardBodyClasses,
        ].join(' ')}
        style={cardSizeStyle}
        onClick={() => onOpen?.()}
        onKeyDown={handleKeyDown}
      >
        <div className={forwardBundleBase.bodyInner}>
          <div className={forwardBundleBase.title}>{titleLabel}</div>
          {previewItems.map((item, idx) => (
            <div key={idx} className={forwardBundleBase.line}>
              {emojiPartsForText(previewLine(item)).map((part, j) =>
                part.type === 'text' ? (
                  <Fragment key={j}>{part.text}</Fragment>
                ) : (
                  <CwViewportImg
                    key={j}
                    src={part.src}
                    alt={part.emoji}
                    className={CW_INLINE_EMOJI_IMG_CLASS}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CwChatMessageForwardBundle
