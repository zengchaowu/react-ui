import { useEffect, useRef } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'
import CwAvatar from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../CwAvatar/cwAvatarPresets'
import CwTooltip from '../CwTooltip/CwTooltip'
import type { CwTooltipInstance } from '../CwTooltip/types'
import CwLoading from '../CwLoading/CwLoading'
import CwChatShellConnDot from './CwChatShellConnDot'
import type { CwChatShellNavMineFooterProps } from './types'
import {
  CW_CHAT_SHELL_DEFAULT_AVATAR_SRC,
  CW_CHAT_SHELL_MINE_AVATAR_SIZE,
  CW_CHAT_SHELL_NAV_MINE_FOOTER_TOOLTIP_OFFSET,
  CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
} from './constants'
import { createTooltipLongPressHandlers } from '@zengchaowu/shared/functions/dom/createTooltipLongPressHandlers'

export function CwChatShellNavMineFooter({
  active = false,
  avatarSrc = '',
  avatarText = '我',
  avatarFallbackSrc = CW_CHAT_SHELL_DEFAULT_AVATAR_SRC,
  loading = false,
  connDotState = 'muted',
  connDotTitle = '预览：未连接实时通道',
  showConnDot = true,
  tooltipShowDelay = CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
  tooltipOffset = CW_CHAT_SHELL_NAV_MINE_FOOTER_TOOLTIP_OFFSET,
  tooltipTouchLongPress = false,
  onClick,
}: CwChatShellNavMineFooterProps) {
  const mineTooltipRef = useRef<CwTooltipInstance | null>(null)

  const tooltipTouchLongPressRef = useRef(tooltipTouchLongPress)
  tooltipTouchLongPressRef.current = tooltipTouchLongPress

  const mineLongPressRef = useRef<ReturnType<typeof createTooltipLongPressHandlers> | null>(
    null,
  )
  if (!mineLongPressRef.current) {
    mineLongPressRef.current = createTooltipLongPressHandlers({
      enabled: () => tooltipTouchLongPressRef.current === true,
      onLongPress: () => {
        void mineTooltipRef.current?.show?.()
      },
    })
  }
  const mineLongPress = mineLongPressRef.current

  useEffect(() => {
    return () => {
      mineLongPress.clearTimer()
    }
  }, [mineLongPress])

  function onMineTouchStart(e: ReactTouchEvent<HTMLDivElement>) {
    mineLongPress.onTouchStart(e)
  }

  function onMineTouchMove(e: ReactTouchEvent<HTMLDivElement>) {
    mineLongPress.onTouchMove(e)
  }

  function onMineTouchEnd() {
    mineLongPress.onTouchEnd()
  }

  function onMineClick() {
    if (mineLongPress.consumeSuppressClick()) return
    onClick?.()
  }

  return (
    <CwTooltip
      ref={mineTooltipRef}
      content="我的"
      placement="right"
      trigger={tooltipTouchLongPress ? 'manual' : 'hover'}
      showDelay={tooltipShowDelay}
      offset={tooltipOffset}
      flip={false}
      closeOnClickOutside={tooltipTouchLongPress ? true : undefined}
      appearance="inline"
      className="inline-flex shrink-0 items-center"
      triggerSlot={
        <div
          role="button"
          tabIndex={0}
          className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[var(--cw-chat-shell-chrome-fg)] transition-colors duration-150 ease-out hover:text-[var(--cw-chat-shell-chrome-fg-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--cw-chat-shell-chrome-focus-ring)] focus-visible:outline-offset-2"
          aria-label="我的"
          onClick={onMineClick}
          onTouchStart={onMineTouchStart}
          onTouchMove={onMineTouchMove}
          onTouchEnd={onMineTouchEnd}
          onTouchCancel={onMineTouchEnd}
        >
          <span
            className={[
              'inline-flex rounded-[var(--radius-default)] align-middle leading-none',
              active && 'ring-2 ring-[var(--brand-color-6)]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <CwAvatar
              {...CW_CHAT_AVATAR_PROPS}
              size={CW_CHAT_SHELL_MINE_AVATAR_SIZE}
              className="shrink-0"
              src={avatarSrc}
              fallbackSrc={avatarFallbackSrc}
              text={avatarText}
              texts={{ defaultAlt: '我' }}
              badge={
                showConnDot ? (
                  <CwChatShellConnDot state={connDotState} title={connDotTitle} tabbar />
                ) : undefined
              }
            />
          </span>
          {loading ? (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-[var(--z-index-above)] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--cw-chat-shell-chrome-overlay)]"
              aria-hidden="true"
            >
              <CwLoading type="spinner" size="small" />
            </div>
          ) : null}
        </div>
      }
    />
  )
}

export default CwChatShellNavMineFooter
