import { useMemo } from 'react'
import CwTabbar from '../CwTabbar/CwTabbar'
import CwChatShellTabIcon from './CwChatShellTabIcon'
import type {
  CwChatShellMobileTabbarProps,
  CwChatShellTabItem,
} from './types'
import { chatShellMobileTabbarBase } from './styles'
import { defaultCwChatShellMobileTabbarTexts } from './texts'
import {
  CW_CHAT_SHELL_MINE_AVATAR_SIZE,
  CW_CHAT_SHELL_MOBILE_TABBAR_TOOLTIP_OFFSET,
  CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
} from './constants'

export function CwChatShellMobileTabbar({
  value,
  items,
  disabled = false,
  readonly = false,
  tooltipShowDelay = CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
  tooltipOffset = CW_CHAT_SHELL_MOBILE_TABBAR_TOOLTIP_OFFSET,
  texts: textsProp,
  className,
  itemIconSlot,
  onUpdateModelValue,
  onChange,
}: CwChatShellMobileTabbarProps) {
  const texts = useMemo(
    () => ({ ...defaultCwChatShellMobileTabbarTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  function onTabbarUpdate(key: string) {
    onUpdateModelValue?.(key)
  }

  function onTabbarChange(key: string, item: CwChatShellTabItem) {
    onChange?.(key, item)
  }

  return (
    <div className={[chatShellMobileTabbarBase.root, className].filter(Boolean).join(' ')}>
      <CwTabbar
        value={value}
        appearance="bottom-bar"
        showTopDivider={false}
        size="md"
        items={items}
        disabled={disabled}
        readonly={readonly}
        tooltipShowDelay={tooltipShowDelay}
        tooltipOffset={tooltipOffset}
        texts={{ tabbarLabel: texts.tabbarLabel }}
        onUpdateModelValue={onTabbarUpdate}
        onChange={onTabbarChange}
        itemIconSlot={(slotProps) =>
          itemIconSlot ? (
            itemIconSlot({
              ...slotProps,
              item: slotProps.item as CwChatShellTabItem,
            })
          ) : (
            <CwChatShellTabIcon
              item={slotProps.item as CwChatShellTabItem}
              active={slotProps.active}
              iconStyles={slotProps.iconStyles}
              mineAvatarSize={CW_CHAT_SHELL_MINE_AVATAR_SIZE}
            />
          )
        }
      />
    </div>
  )
}

export default CwChatShellMobileTabbar
