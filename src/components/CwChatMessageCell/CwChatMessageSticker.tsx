import type { CSSProperties } from 'react'
import type { CwChatMessageStickerProps } from './messageParts.types'
import {
  computeImageOrVideoBubbleSizeStyle,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageBubbleLayout'
import { chatOwnMediaBubbleRingClasses } from './chatMessageBubbleSurface'

export function CwChatMessageSticker({
  chatMessageId,
  imageUrl,
  stickerName,
  width,
  height,
  maxWidth = 120,
  maxHeight = 120,
  showOnRight = false,
  onClick,
}: CwChatMessageStickerProps) {
  const displaySrc = imageUrl?.trim() ?? ''

  const bubbleSizeStyle: CSSProperties = (() => {
    if (width && height) {
      return computeImageOrVideoBubbleSizeStyle(width, height, {
        maxWidth: maxWidth ?? 120,
        maxHeight: maxHeight ?? 120,
      })
    }
    return {
      width: `${maxWidth ?? 120}px`,
      height: `${maxHeight ?? 120}px`,
    }
  })()

  return (
    <div
      className={[
        'flex min-w-0',
        showOnRight ? 'w-full justify-end' : 'w-full justify-start',
      ].join(' ')}
    >
      <div
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        className={[
          'cursor-pointer overflow-hidden',
          showOnRight ? chatOwnMediaBubbleRingClasses : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={bubbleSizeStyle}
        onClick={() => {
          if (!displaySrc) return
          onClick?.()
        }}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={stickerName || '表情'}
            className="block h-full w-full object-contain select-none pointer-events-none"
            draggable="false"
          />
        ) : null}
      </div>
    </div>
  )
}

export default CwChatMessageSticker
