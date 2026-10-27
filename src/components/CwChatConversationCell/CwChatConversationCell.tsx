import { useEffect, useMemo, useRef, type HTMLAttributes } from 'react'
import { CwAvatar } from '../CwAvatar'
import {
  CW_CHAT_AVATAR_PROPS,
  CW_CHAT_CONVERSATION_AVATAR_DEFAULT_SIZE,
} from '@zengchaowu/ui-shared/components/CwAvatar/cwAvatarPresets'
import { CwBadge } from '../CwBadge'
import { CwSwipeRow } from '../CwSwipeRow'
import { conversationCellBase } from './styles'
import { defaultCwChatConversationCellTexts } from '@zengchaowu/ui-shared/components/CwChatConversationCell/texts'
import { bindDeferredEmojiImages } from './bindDeferredEmojiImages'
import type { CwChatConversationCellProps } from './types'

export interface CwChatConversationCellComponentProps
  extends CwChatConversationCellProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'onClick' | 'title' | 'content'
    > {
  className?: string
}

const cellStyles = conversationCellBase

export function CwChatConversationCell({
  name,
  avatar,
  avatarFallbackSrc,
  description,
  time,
  unreadCount,
  unreadMax,
  showRedDot,
  selected = false,
  texts: textsProp,
  swipeActions,
  swipeDirectionThresholdPx,
  swipeOpenThresholdMinPx,
  swipeOpenThresholdRatio,
  swipeRowKey,
  swipePeerOpenKey,
  showBodyInsetDivider,
  nameSlot,
  descriptionSlot,
  onClick,
  onSwipeAction,
  onSwipeOpenChange,
  className,
  ...rest
}: CwChatConversationCellComponentProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwChatConversationCellTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const rowContentClass = useMemo(
    () =>
      [
        cellStyles.root,
        selected ? cellStyles.rootSelected : cellStyles.rootUnselected,
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [selected, className],
  )

  const avatarSrc = useMemo(() => {
    const s = avatar?.trim()
    return s && s.length > 0 ? s : undefined
  }, [avatar])

  const avatarFallbackText = useMemo(() => {
    const n = name?.trim()
    if (n) return n
    return texts.avatarFallbackSymbol
  }, [name, texts.avatarFallbackSymbol])

  const hasUnreadCount = useMemo(
    () =>
      typeof unreadCount === 'number' &&
      Number.isFinite(unreadCount) &&
      unreadCount > 0,
    [unreadCount],
  )

  const showRedDotOnly = !hasUnreadCount && !!showRedDot

  const descriptionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unbind = bindDeferredEmojiImages(descriptionRef.current)
    return () => unbind()
  }, [description])

  return (
    <CwSwipeRow
      {...rest}
      contentClass={rowContentClass}
      swipeActions={swipeActions}
      swipeDirectionThresholdPx={swipeDirectionThresholdPx}
      swipeOpenThresholdMinPx={swipeOpenThresholdMinPx}
      swipeOpenThresholdRatio={swipeOpenThresholdRatio}
      swipeRowKey={swipeRowKey}
      swipePeerOpenKey={swipePeerOpenKey}
      showBodyInsetDivider={showBodyInsetDivider}
      bodyInsetDividerClass={cellStyles.rowDividerInset}
      onClick={onClick}
      onSwipeAction={onSwipeAction}
      onSwipeOpenChange={onSwipeOpenChange}
    >
      <div className={cellStyles.avatarWrap}>
        <CwBadge
          size="xsmall"
          appearance="corner-dot"
          dot={showRedDotOnly}
          content={hasUnreadCount ? unreadCount : undefined}
          max={unreadMax ?? 99}
        >
          <CwAvatar
            {...CW_CHAT_AVATAR_PROPS}
            src={avatarSrc}
            fallbackSrc={avatarFallbackSrc}
            text={avatarFallbackText}
            size={CW_CHAT_CONVERSATION_AVATAR_DEFAULT_SIZE}
          />
        </CwBadge>
      </div>
      <div className={cellStyles.body}>
        <div className={cellStyles.rowTop}>
          <div className={cellStyles.nameRow}>
            <span className={cellStyles.name}>{name}</span>
            {nameSlot}
          </div>
          <span className={cellStyles.time}>{time}</span>
        </div>
        <div className={cellStyles.rowBottom}>
          <div
            ref={descriptionRef}
            className={cellStyles.description}
            dangerouslySetInnerHTML={{ __html: description }}
          />
          {descriptionSlot}
        </div>
      </div>
    </CwSwipeRow>
  )
}

export default CwChatConversationCell
