import type { ImWalletTransferExtra } from '@zengchaowu/shared/types/im-wallet-message'
import {
  CHAT_WALLET_BUBBLE_WRAPPER_CLASS,
  chatWalletBubbleSizeStyle,
} from './chatMessageBubbleLayout'
import {
  chatWalletCardBodyClasses,
  chatWalletCardContentClasses,
  chatWalletCardIconBoxClasses,
  chatWalletTransferBrandClasses,
  chatWalletTransferIconGlyphClasses,
  chatWalletTransferRootClasses,
  chatWalletTransferSublineClasses,
  chatWalletTransferTitleClasses,
} from './chatMessageWalletBubbleSurface'
import {
  defaultCwChatMessageTransferTexts,
  type CwChatMessageTransferTexts,
} from './transferTexts'

export interface CwChatMessageTransferProps {
  chatMessageId: string
  transfer: ImWalletTransferExtra
  showOnRight?: boolean
  isOwn?: boolean
  transferProfileResolver?: (userId: string) => { name: string } | undefined
  mentionLabelResolver?: (userId: string) => string
  /** 成员数 > 2 的多人会话；影响己方气泡主标题文案 */
  conversationIsMultiParty?: boolean
  texts?: Partial<CwChatMessageTransferTexts>
  /** 等价 Vue `@click` */
  onClick?: () => void
}

export function CwChatMessageTransfer({
  chatMessageId,
  transfer,
  showOnRight = false,
  isOwn = false,
  transferProfileResolver,
  mentionLabelResolver,
  conversationIsMultiParty = false,
  texts: textsProp,
  onClick,
}: CwChatMessageTransferProps) {
  const texts = {
    ...defaultCwChatMessageTransferTexts,
    ...(textsProp ?? {}),
  }

  const cardSizeStyle = chatWalletBubbleSizeStyle()

  const amountWithSymbol = (() => {
    const cur = transfer.currency?.trim() || 'CNY'
    const sym = cur === 'CNY' ? '¥' : `${cur} `
    return `${sym}${transfer.amount.toFixed(2)}`
  })()

  const receiverName = (() => {
    const stored = transfer.receiver_name?.trim()
    if (stored) return stored
    const rid = transfer.receiver_id?.trim()
    if (!rid) return texts.receiverFallback
    return (
      transferProfileResolver?.(rid)?.name?.trim() ||
      mentionLabelResolver?.(rid)?.trim() ||
      texts.receiverFallback
    )
  })()

  const titleText =
    isOwn && conversationIsMultiParty
      ? texts.transferToTitle.replace('{name}', receiverName)
      : amountWithSymbol

  const sublineText = isOwn
    ? texts.ownTransferSubline
    : transfer.greeting?.trim() || texts.peerTransferGreeting

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
        className={[chatWalletTransferRootClasses, 'cursor-pointer active:opacity-95'].join(
          ' ',
        )}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          activate()
        }}
      >
        <div className={chatWalletCardBodyClasses}>
          <div className={chatWalletCardIconBoxClasses} aria-hidden="true">
            <span
              className={[
                'asset icon-chat--social--transfer-line',
                chatWalletTransferIconGlyphClasses,
              ].join(' ')}
            />
          </div>

          <div className={chatWalletCardContentClasses}>
            <div className={chatWalletTransferTitleClasses}>{titleText}</div>
            <div className={chatWalletTransferSublineClasses}>{sublineText}</div>
          </div>
        </div>

        {brandLabel ? (
          <span className={chatWalletTransferBrandClasses}>{brandLabel}</span>
        ) : null}
      </div>
    </div>
  )
}

export default CwChatMessageTransfer
