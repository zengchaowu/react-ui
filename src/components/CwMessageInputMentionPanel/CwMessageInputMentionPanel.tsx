import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import { CwPopup } from '../CwPopup/CwPopup'
import { CwAvatar } from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../CwAvatar/cwAvatarPresets'
import type { CwAvatarProps } from '../CwAvatar/types'
import type { CwPopupInstance } from '../CwPopup/types'
import { createDimensions } from '../CwPopup/plugins/dimensions'
import { createFlip } from '../CwPopup/plugins/flip'
import { createPosition } from '../CwPopup/plugins/position'
import { createOffset } from '../CwPopup/plugins/offset'
import { createPreventOverflow } from '../CwPopup/plugins/prevent-overflow'
import { createArrow } from '../CwPopup/plugins/arrow'
import { mentionPanelBase } from './styles'
import { defaultCwMessageInputMentionPanelTexts } from './texts'
import type { CwMessageInputMentionItem } from '../CwMessageInput/types'
import type {
  CwMessageInputMentionPanelComponentProps,
  CwMessageInputMentionPanelHandle,
  CwMessageInputMentionPanelTexts,
} from './types'

const defaultMentionPlugins = [
  createDimensions(),
  createFlip({ padding: 8 }),
  createPosition(),
  createOffset({ offset: 8 }),
  createPreventOverflow({ padding: 8 }),
  createArrow({
    margin: 8,
    arrowClass: 'h-2 w-2 bg-[var(--bg-color-container)] border-[var(--border-color)]',
  }),
]

/** 与面板行 24×24 区域对齐的 `CwAvatar`（无头像 URL 或加载失败走 `fallbackSrc`） */
const mentionRowAvatarStyles = {
  ...CW_CHAT_AVATAR_PROPS,
  size: 1.5,
  className: mentionPanelBase.mentionAvatarWrap,
} satisfies Partial<CwAvatarProps>

function mentionItemAvatar(item: CwMessageInputMentionItem): string | undefined {
  const trimmed = item.avatar?.trim()
  return trimmed || undefined
}

export const CwMessageInputMentionPanel = forwardRef<
  CwMessageInputMentionPanelHandle,
  CwMessageInputMentionPanelComponentProps
>(function CwMessageInputMentionPanel(
  {
    value,
    modelValue,
    virtualReference,
    plugins,
    items,
    mentionAvatarFallbackSrc,
    highlightIndex,
    optionIdPrefix = 'cw-message-input-mention-opt',
    texts: textsProp,
    onChange,
    onSelect,
    ...rest
  },
  ref,
) {
  const popupRef = useRef<CwPopupInstance | null>(null)

  const isOpen = value ?? modelValue ?? false

  const resolvedPlugins = plugins ?? defaultMentionPlugins

  const texts = useMemo<CwMessageInputMentionPanelTexts>(
    () => ({
      ...defaultCwMessageInputMentionPanelTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const safeHighlightIndex =
    items.length === 0 ? 0 : Math.min(highlightIndex, items.length - 1)

  const highlightedId =
    items.length === 0 ? '' : (items[safeHighlightIndex]?.id ?? '')

  useImperativeHandle(
    ref,
    () => ({
      updatePosition: () => popupRef.current?.updatePosition(),
    }),
    [],
  )

  return (
    <CwPopup
      ref={popupRef}
      modelValue={isOpen}
      virtualReference={virtualReference}
      placement="bottom-start"
      trigger="manual"
      plugins={resolvedPlugins}
      popupClass={mentionPanelBase.mentionPanel}
      triggerClass=""
      closeOnClickOutside={false}
      onUpdateModelValue={(next) => onChange?.(next)}
      {...rest}
    >
      <div
        role="listbox"
        className={mentionPanelBase.mentionList}
        aria-activedescendant={
          highlightedId ? `${optionIdPrefix}-${highlightedId}` : undefined
        }
      >
        {items.length > 0 ? (
          items.map((item, index) => {
            const highlighted = index === safeHighlightIndex
            return (
              <div
                key={item.id}
                id={`${optionIdPrefix}-${item.id}`}
                role="option"
                tabIndex={0}
                aria-selected={highlighted}
                className={[
                  mentionPanelBase.mentionOption,
                  highlighted
                    ? mentionPanelBase.mentionOptionKeyboard
                    : mentionPanelBase.mentionOptionHover,
                  'cursor-pointer',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(event) => {
                  event.preventDefault()
                  onSelect?.(item)
                }}
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
          <div className={mentionPanelBase.mentionEmpty}>
            {texts.mentionNoMatch}
          </div>
        )}
      </div>
    </CwPopup>
  )
})

export default CwMessageInputMentionPanel
