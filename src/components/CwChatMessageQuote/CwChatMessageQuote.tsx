import { Fragment, useMemo } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { CW_INLINE_EMOJI_IMG_CLASS, splitTextToEmojiParts } from './emojioneEmoji'
import { usePublicAssetBaseUrl } from '../../utils/publicAssetBaseUrl'
import { CwViewportImg } from '../CwViewportImg'
import { quoteBase } from './styles'
import type { CwChatMessageQuoteProps } from './types'

export function CwChatMessageQuote({
  preview,
  dismissible = false,
  navigable = false,
  onDismiss,
  onNavigate,
  className,
  ...rest
}: CwChatMessageQuoteProps) {
  const publicAssetBaseUrl = usePublicAssetBaseUrl()

  const snippetParts = useMemo(
    () => splitTextToEmojiParts(preview.snippet, publicAssetBaseUrl),
    [preview.snippet, publicAssetBaseUrl],
  )

  const isNavigable = navigable && !preview.missing

  function onRootClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
    if (dismissible || !navigable || preview.missing) return
    onNavigate?.()
  }

  function onDismissClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    onDismiss?.()
  }

  function onDismissKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    onDismiss?.()
  }

  const rootClass = [
    quoteBase.root,
    preview.missing && quoteBase.rootMissing,
    dismissible && quoteBase.rootComposer,
    isNavigable && quoteBase.rootNavigable,
    isNavigable && 'border-0 p-0 text-left',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const ariaLabel = preview.missing
    ? '引用内容不存在'
    : `引用 ${preview.senderName}`

  const content: ReactNode = (
    <>
      <div className={quoteBase.body}>
        {!preview.missing && preview.senderName && (
          <div className={quoteBase.sender}>{preview.senderName}</div>
        )}
        <div className={quoteBase.snippet}>
          {snippetParts.map((part, j) =>
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
      </div>
      {dismissible && (
        <div
          role="button"
          tabIndex={0}
          className={[quoteBase.dismissBtn, 'cursor-pointer']
            .filter(Boolean)
            .join(' ')}
          aria-label="取消引用"
          onClick={onDismissClick}
          onKeyDown={onDismissKeyDown}
        >
          ×
        </div>
      )}
    </>
  )

  if (isNavigable) {
    return (
      <button
        type="button"
        className={rootClass}
        aria-label={ariaLabel}
        onClick={onRootClick}
        {...rest}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={rootClass}
      aria-label={ariaLabel}
      onClick={onRootClick}
      {...rest}
    >
      {content}
    </div>
  )
}

export default CwChatMessageQuote
