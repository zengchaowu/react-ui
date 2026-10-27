import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import CwChatShellNav from './CwChatShellNav'
import CwChatShellMobileTabbar from './CwChatShellMobileTabbar'
import type { CwChatShellLayoutProps, CwChatShellTabItem } from './types'
import {
  CW_CHAT_SHELL_MOBILE_TABBAR_TOOLTIP_OFFSET,
  CW_CHAT_SHELL_NAV_TABBAR_TOOLTIP_OFFSET,
} from '@zengchaowu/ui-shared/components/CwChatShell/constants'
import { defaultCwChatShellLayoutStyles } from '@zengchaowu/ui-shared/components/CwChatShell/styles'
import { tabbarOuterEdgeTopHairline } from '@zengchaowu/ui-shared/components/CwTabbar/styles'

export function CwChatShellLayout({
  value,
  navItems,
  mobileItems,
  showNav = true,
  navVisible = true,
  showMobileTabbar = false,
  frameHeight,
  navTooltipOffset = CW_CHAT_SHELL_NAV_TABBAR_TOOLTIP_OFFSET,
  mobileTooltipOffset = CW_CHAT_SHELL_MOBILE_TABBAR_TOOLTIP_OFFSET,
  navTooltipTouchLongPress = false,
  itemIconSlot,
  footerSlot,
  mainSlot,
  onUpdateModelValue,
  onChange,
}: CwChatShellLayoutProps) {
  const layoutStyles = defaultCwChatShellLayoutStyles

  const rootClassList = useMemo(
    () =>
      [layoutStyles.root, showMobileTabbar && layoutStyles.rootMobileBottomTab]
        .filter(Boolean)
        .join(' '),
    [layoutStyles, showMobileTabbar],
  )

  const rootStyle = useMemo<CSSProperties | undefined>(() => {
    if (!frameHeight) return undefined
    const h = frameHeight
    return {
      height: h,
      minHeight: h,
      maxHeight: h,
      '--chat-viewport-height': h,
    } as CSSProperties
  }, [frameHeight])

  function onModelUpdate(key: string) {
    onUpdateModelValue?.(key)
  }

  function onItemChange(key: string, item: CwChatShellTabItem) {
    onChange?.(key, item)
  }

  return (
    <div className={rootClassList} style={rootStyle}>
      {showNav ? (
        <CwChatShellNav
          value={value}
          items={navItems}
          tooltipOffset={navTooltipOffset}
          tooltipTouchLongPress={navTooltipTouchLongPress}
          style={{ display: navVisible ? undefined : 'none' }}
          onUpdateModelValue={onModelUpdate}
          onChange={onItemChange}
          itemIconSlot={itemIconSlot}
          footerSlot={footerSlot}
        />
      ) : null}

      <div className={layoutStyles.main}>{mainSlot}</div>

      {showMobileTabbar ? (
        <div
          className={[layoutStyles.mobileTabbarWrap, tabbarOuterEdgeTopHairline]
            .filter(Boolean)
            .join(' ')}
        >
          <CwChatShellMobileTabbar
            value={value}
            items={mobileItems}
            tooltipOffset={mobileTooltipOffset}
            onUpdateModelValue={onModelUpdate}
            onChange={onItemChange}
            itemIconSlot={itemIconSlot}
          />
        </div>
      ) : null}
    </div>
  )
}

export default CwChatShellLayout
