import { tabbarOuterEdgeRightHairline } from '../CwTabbar/styles'
import type { CwChatShellMobileTabbarStyles, CwChatShellNavStyles } from './types'

export const chatShellNavBase: CwChatShellNavStyles = {
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

export const chatShellMobileTabbarBase: CwChatShellMobileTabbarStyles = {
  root: 'cw-chat-shell-mobile-tabbar shrink-0 bg-transparent',
}

import {
  APP_CHROME_SAFE_BOTTOM_CLASS,
  APP_CHROME_SAFE_TOP_CLASS,
  APP_TABBAR_SAFE_BOTTOM_CLASS,
} from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'

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
