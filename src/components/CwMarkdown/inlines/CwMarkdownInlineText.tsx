import { Fragment, useMemo } from 'react'
import type { InlineTextNode } from '../types'
import { useCwMarkdownContext } from '../context'
import {
  CW_INLINE_EMOJI_IMG_CLASS,
  splitTextToEmojiParts,
} from '../../CwChatMessageQuote/emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../../utils/publicAssetBaseUrl'
import { CwViewportImg } from '../../CwViewportImg'

export interface CwMarkdownInlineTextProps {
  node: InlineTextNode
}

export function CwMarkdownInlineText({ node }: CwMarkdownInlineTextProps) {
  const ctx = useCwMarkdownContext()
  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  const sizeClass =
    ctx.size === 'small'
      ? ctx.styles.sizeSmall
      : ctx.size === 'large'
        ? ctx.styles.sizeLarge
        : ctx.styles.sizeMedium

  const emojiParts = useMemo(
    () => splitTextToEmojiParts(node.value ?? '', publicAssetBaseUrl),
    [node.value, publicAssetBaseUrl],
  )

  return (
    <span className={[ctx.styles.inlineText, sizeClass].filter(Boolean).join(' ')}>
      {emojiParts.map((part, j) =>
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
    </span>
  )
}

export default CwMarkdownInlineText
