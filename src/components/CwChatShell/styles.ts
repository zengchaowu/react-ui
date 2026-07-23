import type { CwTabbarStyles } from '../CwTabbar/types'
import { tabbarOuterEdgeRightHairline } from '../CwTabbar/styles'
import type { CwChatShellMobileTabbarStyles, CwChatShellNavStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

/** Tab 图标：尺寸走 --size-tabbar-icon token，CwIcon size: 0 由 CSS 承担 */
const chatShellTabbarItemIconStyles = {
  class: [
    'inline-flex items-center justify-center text-current',
    'size-[var(--size-tabbar-icon)] [font-size:var(--size-tabbar-icon)]',
  ].join(' '),
  size: 0 as const,
}

/** 壳层 Tab 项共用外形（横/纵一致圆角，选中无底色） */
const chatShellTabItemShape = [
  'relative flex flex-col items-center justify-center gap-0.5 overflow-visible',
  'rounded-md outline-none focus:outline-none transition-none',
].join(' ')

/** PC 侧栏 / 移动底栏共用 Tab 项样式（颜色走 --cw-chat-shell-tab-* token） */
export const defaultChatShellTabbarStyles: Partial<CwTabbarStyles> = {
  item: [chatShellTabItemShape, 'px-2 py-2.5 w-full max-w-full min-h-[var(--size-tabbar-item)]'].join(' '),
  itemNormal: [
    'cursor-pointer text-[var(--cw-chat-shell-tab-fg)]',
    'hover:text-[var(--cw-chat-shell-tab-fg-hover)]',
    'hover:bg-[var(--cw-chat-shell-tab-bg-hover)]',
  ].join(' '),
  itemActive: 'cursor-pointer text-[var(--brand-color-6)]',
  itemLabelNormal: 'text-inherit',
  itemLabelActive: 'text-[var(--brand-color-6)] font-medium',
  itemFocused: INTERACTIVE_FOCUS_CLASS,
  itemIconStyles: chatShellTabbarItemIconStyles,
}

/** 移动端底栏布局（仅结构，颜色见 defaultChatShellTabbarStyles） */
export const defaultChatShellMobileTabbarLayoutStyles: Partial<CwTabbarStyles> = {
  items: 'flex items-center justify-around overflow-visible w-full px-2 py-1',
  item: [chatShellTabItemShape, 'px-2 py-1 min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)]'].join(' '),
  itemContent: 'flex flex-col items-center justify-center gap-0.5 overflow-visible',
  itemLabel: 'text-xs leading-none',
  itemIconStyles: chatShellTabbarItemIconStyles,
}

export const defaultCwChatShellNavStyles: CwChatShellNavStyles = {
  root: [
    'cw-chat-shell-nav',
    'flex shrink-0 flex-col items-stretch self-stretch min-h-0 min-w-0',
    'bg-[var(--cw-chat-shell-chrome-bg)]',
    '[--bg-color-container:var(--cw-chat-shell-chrome-bg)]',
    `relative ${tabbarOuterEdgeRightHairline}`,
  ].join(' '),
  tabbarWrap: 'shrink-0',
  footer: 'mt-auto shrink-0 flex justify-center py-2 pb-3',
}

export const defaultCwChatShellMobileTabbarStyles: CwChatShellMobileTabbarStyles = {
  root: 'cw-chat-shell-mobile-tabbar shrink-0 bg-transparent',
}

import {
  APP_CHROME_SAFE_BOTTOM_CLASS,
  APP_CHROME_SAFE_TOP_CLASS,
  APP_TABBAR_SAFE_BOTTOM_CLASS,
} from '../../constants/appSafeAreaClasses'

/** CwChatShellLayout 根与子区域（仅根块名 `cw-chat-shell-layout`，子区域用 Tailwind） */
export const defaultCwChatShellLayoutStyles = {
  root: [
    'cw-chat-shell-layout flex flex-1 flex-row w-full h-full min-h-0 max-h-full box-border overflow-hidden bg-[var(--bg-color-container)]',
    APP_CHROME_SAFE_TOP_CLASS,
    APP_CHROME_SAFE_BOTTOM_CLASS,
    '[--chat-viewport-height:100%]',
  ].join(' '),
  rootMobileBottomTab: 'flex-col',
  main: 'flex flex-1 flex-col min-w-0 min-h-0 bg-[var(--chat-ding-sidebar-bg)]',
  mobileTabbarWrap: [
    'relative w-full shrink-0 bg-[var(--cw-chat-shell-chrome-bg)]',
    APP_TABBAR_SAFE_BOTTOM_CLASS,
    '[--bg-color-container:var(--cw-chat-shell-chrome-bg)]',
  ].join(' '),
}

export const defaultCwChatShellConnDotStyles = {
  root:
    'cw-chat-shell-conn-dot box-border block h-[0.5625rem] w-[0.5625rem] rounded-full border-2 border-[var(--cw-chat-shell-chrome-bg)]',
  rootTabbar: 'h-3 w-3',
  stateConnected: 'bg-[var(--success-color-6)]',
  stateConnecting: 'bg-[var(--warning-color-6)]',
  stateDisconnected: 'bg-[var(--error-color-6)]',
  stateMuted: 'bg-[var(--cw-chat-shell-chrome-dot-muted)]',
}
