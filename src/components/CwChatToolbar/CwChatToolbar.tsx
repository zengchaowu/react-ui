import {
  Fragment,
  useMemo,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwTooltip from '../CwTooltip/CwTooltip'
import CwChatToolbarEmojiPopup from './CwChatToolbarEmojiPopup'
import type {
  CwChatToolbarIconComponent,
  CwChatToolbarItemConfig,
  CwChatToolbarItemSlotProps,
  CwChatToolbarProps,
} from './types'
import { defaultCwChatToolbarTexts } from './texts'
import { chatToolbarBase } from './styles'

export interface CwChatToolbarComponentProps
  extends CwChatToolbarProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  className?: string
}

export function CwChatToolbar({
  disabled = false,
  items = [],
  stickerPacks = [],
  rootClass = '',
  texts: textsProp,
  prependSlot,
  appendSlot,
  itemSlots,
  onItemClick,
  onEmojiPick,
  onStickerPick,
  onExpressionPanelOpen,
  className,
  ...rest
}: CwChatToolbarComponentProps) {
  const texts = useMemo(
    () => ({
      ...defaultCwChatToolbarTexts,
      ...(textsProp ?? {}),
    }),
    [textsProp],
  )

  const itemsSafe = items ?? []

  const shouldShow =
    itemsSafe.length > 0 || prependSlot != null || appendSlot != null

  function iconAsComponent(
    icon: CwChatToolbarItemConfig['icon'],
  ): CwChatToolbarIconComponent | null {
    if (icon == null) return null
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      return icon as CwChatToolbarIconComponent
    }
    return null
  }

  function assetIconName(icon: CwChatToolbarItemConfig['icon']): string {
    if (typeof icon === 'string' && icon.trim() !== '') return icon.trim()
    return texts.fallbackAssetIcon
  }

  function itemDisabled(item: CwChatToolbarItemConfig) {
    return disabled || !!item.disabled
  }

  /** div[role=button] 无原生 :disabled，用 class 复现 itemButton 的禁用样式 */
  function toolbarItemClass(item: CwChatToolbarItemConfig) {
    return [
      chatToolbarBase.itemButton,
      item.buttonClass,
      'cursor-pointer',
      itemDisabled(item) ? 'pointer-events-none opacity-40' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  function emitItemClick(item: CwChatToolbarItemConfig) {
    if (itemDisabled(item)) return
    onItemClick?.(item)
  }

  function isEmojiItem(item: CwChatToolbarItemConfig) {
    return item.key === 'emoji'
  }

  function renderIcon(item: CwChatToolbarItemConfig) {
    const IconComponent = iconAsComponent(item.icon)
    if (IconComponent) return <IconComponent />
    return <CwIcon name={assetIconName(item.icon)} size={1.25} />
  }

  function onItemKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    item: CwChatToolbarItemConfig,
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    emitItemClick(item)
  }

  function renderItemButton(item: CwChatToolbarItemConfig, emitsClick: boolean) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={item.label}
        aria-disabled={itemDisabled(item) ? 'true' : 'false'}
        className={toolbarItemClass(item)}
        onClick={emitsClick ? () => emitItemClick(item) : undefined}
        onKeyDown={(event) => onItemKeyDown(event, item)}
      >
        {renderIcon(item)}
      </div>
    )
  }

  function renderSlot(
    slot:
      | ReactNode
      | ((scope: CwChatToolbarItemSlotProps) => ReactNode)
      | undefined,
    scope: CwChatToolbarItemSlotProps,
  ): ReactNode {
    if (typeof slot === 'function') {
      return (slot as (s: CwChatToolbarItemSlotProps) => ReactNode)(scope)
    }
    return slot ?? null
  }

  function renderItem(item: CwChatToolbarItemConfig) {
    const scope: CwChatToolbarItemSlotProps = {
      item,
      disabled: itemDisabled(item),
      onClick: () => emitItemClick(item),
      assetIconName: assetIconName(item.icon),
      iconComponent: iconAsComponent(item.icon),
    }

    const customSlot = itemSlots?.[`item-${item.key}`]
    if (customSlot !== undefined) {
      return renderSlot(customSlot, scope)
    }

    if (isEmojiItem(item)) {
      return (
        <CwChatToolbarEmojiPopup
          stickerPacks={stickerPacks}
          texts={texts}
          onPick={onEmojiPick}
          onStickerPick={onStickerPick}
          onExpressionPanelOpen={onExpressionPanelOpen}
          triggerSlot={renderItemButton(item, false)}
        />
      )
    }

    if (item.label?.trim()) {
      return (
        <CwTooltip
          content={item.label.trim()}
          placement="top"
          appearance="inline"
          className="inline-flex w-auto max-w-full min-w-0 shrink-0 items-center"
          triggerSlot={renderItemButton(item, true)}
        />
      )
    }

    return renderItemButton(item, true)
  }

  if (!shouldShow) return null

  return (
    <div
      {...rest}
      className={[chatToolbarBase.root, rootClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={chatToolbarBase.cluster}>{prependSlot}</div>
      <div className={chatToolbarBase.cluster}>
        {itemsSafe.map((item) => (
          <Fragment key={item.key}>{renderItem(item)}</Fragment>
        ))}
      </div>
      <div className={['ml-auto', chatToolbarBase.cluster].filter(Boolean).join(' ')}>
        {appendSlot}
      </div>
    </div>
  )
}

export default CwChatToolbar
