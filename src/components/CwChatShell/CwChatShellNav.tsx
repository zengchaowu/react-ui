import { useMemo } from 'react'
import CwTabbar from '../CwTabbar/CwTabbar'
import CwChatShellTabIcon from './CwChatShellTabIcon'
import type {
  CwChatShellNavProps,
  CwChatShellTabItem,
} from './types'
import { chatShellNavBase } from '@zengchaowu/ui-shared/components/CwChatShell/styles'
import { defaultCwChatShellNavTexts } from '@zengchaowu/ui-shared/components/CwChatShell/texts'
import {
  CW_CHAT_SHELL_NAV_TABBAR_TOOLTIP_OFFSET,
  CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
} from '@zengchaowu/ui-shared/components/CwChatShell/constants'

export function CwChatShellNav({
  value,
  items,
  disabled = false,
  readonly = false,
  tabbarSize = 'lg',
  tooltipShowDelay = CW_CHAT_SHELL_TOOLTIP_SHOW_DELAY_MS,
  tooltipOffset = CW_CHAT_SHELL_NAV_TABBAR_TOOLTIP_OFFSET,
  tooltipTouchLongPress = false,
  texts: textsProp,
  className,
  style,
  itemIconSlot,
  footerSlot,
  onUpdateModelValue,
  onChange,
}: CwChatShellNavProps) {
  const texts = useMemo(
    () => ({ ...defaultCwChatShellNavTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  function onTabbarUpdate(key: string) {
    onUpdateModelValue?.(key)
  }

  function onTabbarChange(key: string, item: CwChatShellTabItem) {
    onChange?.(key, item)
  }

  return (
    <nav
      className={[chatShellNavBase.root, className].filter(Boolean).join(' ')}
      style={style}
      aria-label={texts.navAriaLabel}
    >
      <div className={chatShellNavBase.tabbarWrap}>
        <CwTabbar
          value={value}
          appearance="sidebar"
          orientation="vertical"
          showTopDivider={false}
          size={tabbarSize}
          items={items}
          preserveModelWhenMissing={true}
          disabled={disabled}
          readonly={readonly}
          tooltipShowDelay={tooltipShowDelay}
          tooltipOffset={tooltipOffset}
          tooltipTouchLongPress={tooltipTouchLongPress}
          tooltipFlip={false}
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
              />
            )
          }
        />
      </div>
      {footerSlot ? <div className={chatShellNavBase.footer}>{footerSlot}</div> : null}
    </nav>
  )
}

export default CwChatShellNav
