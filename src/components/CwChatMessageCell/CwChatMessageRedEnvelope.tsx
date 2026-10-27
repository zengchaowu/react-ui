import type { ImRedEnvelopeExtra } from '@zengchaowu/shared/types/im-wallet-message'
import {
  CHAT_WALLET_BUBBLE_WRAPPER_CLASS,
  chatWalletBubbleSizeStyle,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageBubbleLayout'
import {
  chatWalletCardBodyClasses,
  chatWalletCardContentClasses,
  chatWalletCardIconBoxClasses,
  chatWalletCardIconImageClasses,
  chatWalletRedEnvelopeBrandClasses,
  chatWalletRedEnvelopeFinishedContentClasses,
  chatWalletRedEnvelopeRootClasses,
  chatWalletRedEnvelopeStatusClasses,
  chatWalletRedEnvelopeTitleClasses,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageWalletBubbleSurface'
import {
  defaultCwChatMessageRedEnvelopeTexts,
  type CwChatMessageRedEnvelopeTexts,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/redEnvelopeTexts'

export interface CwChatMessageRedEnvelopeProps {
  chatMessageId: string
  envelope: ImRedEnvelopeExtra
  /** 气泡内图标 URL（由宿主应用提供） */
  iconSrc?: string
  viewerUserId?: string
  showOnRight?: boolean
  isOwn?: boolean
  claiming?: boolean
  texts?: Partial<CwChatMessageRedEnvelopeTexts>
  /** 等价 Vue `@click` */
  onClick?: () => void
}

export function CwChatMessageRedEnvelope({
  chatMessageId,
  envelope,
  iconSrc,
  viewerUserId,
  showOnRight = false,
  isOwn = false,
  claiming = false,
  texts: textsProp,
  onClick,
}: CwChatMessageRedEnvelopeProps) {
  const texts = {
    ...defaultCwChatMessageRedEnvelopeTexts,
    ...(textsProp ?? {}),
  }

  const cardSizeStyle = chatWalletBubbleSizeStyle()

  const resolvedIconSrc = iconSrc?.trim() || ''

  const greetingText =
    envelope.greeting?.trim() || texts.defaultGreeting

  const isLucky = envelope.packet_type === 'lucky'
  const isExpired = envelope.status === 'expired'

  const viewerClaim = (() => {
    const uid = viewerUserId?.trim()
    if (!uid) return undefined
    const fromClaims = envelope.claims?.find((c) => c.user_id === uid)
    if (fromClaims) return fromClaims
    if (!isLucky && envelope.claimed_by === uid) {
      return { user_id: uid, amount: envelope.amount }
    }
    return undefined
  })()

  const viewerHasClaimed = !!viewerClaim

  const isFullyClaimed = (() => {
    if (isLucky) {
      const total = Math.max(1, envelope.packet_count ?? 1)
      const claimed = envelope.claimed_count ?? 0
      return claimed > 0 && claimed >= total
    }
    return envelope.status === 'claimed'
  })()

  const isFinished = viewerHasClaimed || isFullyClaimed || isExpired

  const titleText = claiming ? texts.claiming : greetingText

  const statusSubtext = (() => {
    if (isOwn && !isFullyClaimed && !isExpired) return ''
    if (viewerHasClaimed) return texts.claimed
    if (isExpired) return texts.expired
    if (isFullyClaimed) return texts.fullyClaimed
    return ''
  })()

  const clickable = !claiming && !isExpired

  const finishedContentClass = isFinished
    ? chatWalletRedEnvelopeFinishedContentClasses
    : ''

  const brandLabel = texts.brandLabel.trim()

  function activate() {
    onClick?.()
  }

  return (
    <div
      className={[
        CHAT_WALLET_BUBBLE_WRAPPER_CLASS,
        showOnRight ? 'ml-auto justify-end' : 'justify-start',
      ].join(' ')}
      style={cardSizeStyle}
    >
      <div
        data-chat-message-id={chatMessageId}
        data-cw-chat-message-bubble-body=""
        role="button"
        tabIndex={0}
        className={[
          chatWalletRedEnvelopeRootClasses,
          clickable ? 'cursor-pointer active:opacity-95' : 'cursor-default',
        ].join(' ')}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          activate()
        }}
      >
        <div className={chatWalletCardBodyClasses}>
          <div className={chatWalletCardIconBoxClasses} aria-hidden="true">
            {resolvedIconSrc ? (
              <img
                className={[
                  chatWalletCardIconImageClasses,
                  finishedContentClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
                src={resolvedIconSrc}
                alt=""
                draggable="false"
                decoding="async"
              />
            ) : null}
          </div>
          <div
            className={[chatWalletCardContentClasses, finishedContentClass]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={chatWalletRedEnvelopeTitleClasses}>{titleText}</div>
            {statusSubtext ? (
              <div className={chatWalletRedEnvelopeStatusClasses}>
                {statusSubtext}
              </div>
            ) : null}
          </div>
        </div>

        {brandLabel ? (
          <span
            className={[
              chatWalletRedEnvelopeBrandClasses,
              finishedContentClass,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {brandLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default CwChatMessageRedEnvelope
