import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CwAvatar } from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../CwAvatar/cwAvatarPresets'
import type { CwAvatarProps } from '../CwAvatar/types'
import { CwSearchBar } from '../CwSearchBar/CwSearchBar'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleOverlayEnterVisible } from '../../constants/cwOverlayStack'
import {
  acquireOverlayBodyScrollLock,
  releaseOverlayBodyScrollLock,
} from '../../constants/overlayBodyScrollLock'
import { mentionSheetBase } from './styles'
import { defaultCwMessageInputMentionSheetTexts } from './texts'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'
import type {
  CwMessageInputMentionSheetComponentProps,
  CwMessageInputMentionSheetTexts,
} from './types'

/** 与 Sheet 行 36×36 区域对齐的 `CwAvatar`（无头像 URL 或加载失败走 `fallbackSrc`） */
const mentionRowAvatarStyles = {
  ...CW_CHAT_AVATAR_PROPS,
  size: 2.25,
  className: mentionSheetBase.mentionAvatarWrap,
} satisfies Partial<CwAvatarProps>

function mentionItemAvatar(item: CwMessageInputMentionItem): string | undefined {
  const trimmed = item.avatar?.trim()
  return trimmed || undefined
}

export function CwMessageInputMentionSheet({
  value,
  modelValue,
  searchQuery = '',
  items,
  highlightIndex,
  mentionAvatarFallbackSrc,
  optionIdPrefix = 'cw-message-input-mention-opt',
  texts: textsProp,
  onChange,
  onSearchQueryChange,
  onSelect,
  onDismiss,
  ...rest
}: CwMessageInputMentionSheetComponentProps) {
  const searchBarRef = useRef<HTMLDivElement | null>(null)
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const cancelEnterVisibleRef = useRef<(() => void) | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOpen = value ?? modelValue ?? false

  const valueRef = useRef(isOpen)
  valueRef.current = isOpen

  const texts = useMemo<CwMessageInputMentionSheetTexts>(
    () => ({
      ...defaultCwMessageInputMentionSheetTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const displayItems = useMemo((): CwMessageInputMentionItem[] => {
    if (items.length === 0) return []
    const raw = searchQuery.trim().toLowerCase()
    if (!raw) return items.slice()
    return items.filter((item) => {
      const label = item.label.toLowerCase()
      const id = (item.id ?? '').toLowerCase()
      return label.includes(raw) || id.includes(raw)
    })
  }, [items, searchQuery])

  const safeHighlightIndex =
    displayItems.length === 0
      ? 0
      : Math.min(highlightIndex, displayItems.length - 1)

  const highlightedId =
    displayItems.length === 0 ? '' : (displayItems[safeHighlightIndex]?.id ?? '')

  const clearVisibilityTimers = useCallback(() => {
    cancelEnterVisibleRef.current?.()
    cancelEnterVisibleRef.current = null
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      searchBarRef.current?.querySelector('input')?.focus()
    })
  }, [])

  useEffect(() => {
    clearVisibilityTimers()

    if (isOpen) {
      setIsRendered(true)
      setIsVisible(false)
      cancelEnterVisibleRef.current = scheduleOverlayEnterVisible(() => {
        cancelEnterVisibleRef.current = null
        if (!valueRef.current) return
        setIsVisible(true)
        focusSearchInput()
      })
      return clearVisibilityTimers
    }

    setIsVisible(false)
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null
      if (valueRef.current) return
      setIsRendered(false)
    }, CW_OVERLAY_LEAVE_MS)
    return clearVisibilityTimers
  }, [isOpen, clearVisibilityTimers, focusSearchInput])

  useEffect(() => {
    if (!isVisible) return undefined
    acquireOverlayBodyScrollLock()
    return () => releaseOverlayBodyScrollLock()
  }, [isVisible])

  useEffect(() => clearVisibilityTimers, [clearVisibilityTimers])

  const handleDismiss = useCallback(() => {
    onChange?.(false)
    onDismiss?.()
  }, [onChange, onDismiss])

  if (!isRendered || typeof document === 'undefined') return null

  return createPortal(
    <div
      {...rest}
      className={[
        mentionSheetBase.overlay,
        isVisible ? mentionSheetBase.overlayVisible : mentionSheetBase.overlayHidden,
      ]
        .filter(Boolean)
        .join(' ')}
      role="presentation"
    >
      <div
        className={mentionSheetBase.backdrop}
        aria-hidden="true"
        onClick={handleDismiss}
      />
      <div
        className={[
          mentionSheetBase.panel,
          isVisible ? mentionSheetBase.panelVisible : mentionSheetBase.panelHidden,
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={texts.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={mentionSheetBase.header}>
          <h3 className="m-0 text-center [font-size:var(--chat-conversation-title-font-size)] leading-snug text-[var(--text-color-primary)]">
            {texts.title}
          </h3>
          <div ref={searchBarRef}>
            <CwSearchBar
              value={searchQuery}
              placeholder={texts.searchPlaceholder}
              showButton={false}
              size="medium"
              onChange={(next) => onSearchQueryChange?.(next)}
            />
          </div>
        </div>

        <div
          className={mentionSheetBase.list}
          role="listbox"
          aria-activedescendant={
            highlightedId ? `${optionIdPrefix}-${highlightedId}` : undefined
          }
        >
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => {
              const highlighted = index === safeHighlightIndex
              return (
                <div
                  key={item.id}
                  id={`${optionIdPrefix}-${item.id}`}
                  role="option"
                  tabIndex={0}
                  aria-selected={highlighted}
                  className={[
                    mentionSheetBase.mentionOption,
                    highlighted
                      ? mentionSheetBase.mentionOptionKeyboard
                      : mentionSheetBase.mentionOptionHover,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelect?.(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect?.(item)
                    }
                  }}
                >
                  <CwAvatar
                    src={mentionItemAvatar(item)}
                    fallbackSrc={mentionAvatarFallbackSrc}
                    text={item.label}
                    {...mentionRowAvatarStyles}
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </div>
              )
            })
          ) : (
            <div className={mentionSheetBase.mentionEmpty}>
              {texts.mentionNoMatch}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CwMessageInputMentionSheet
