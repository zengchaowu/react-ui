import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { CW_OVERLAY_ELECTRON_NO_DRAG_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { APP_OVERLAY_SAFE_BOTTOM_CLASS } from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import {
  CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
} from '@zengchaowu/ui-shared/components/CwContextMenu/styles'
import type { CwMessageInputMentionSheetStyles } from './types'

const sheetNoDrag = CW_OVERLAY_ELECTRON_NO_DRAG_CLASS

export const mentionSheetBase: CwMessageInputMentionSheetStyles = {
  overlay: [
    `cw-message-input-mention-sheet fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} flex items-end transition-opacity duration-300`,
    sheetNoDrag,
  ].join(' '),
  overlayVisible: 'opacity-100',
  overlayHidden: 'opacity-0',
  backdrop: [
    'absolute inset-0 bg-[var(--mask-active)]',
    sheetNoDrag,
  ].join(' '),
  panel: [
    `cw-message-input-mention-sheet__panel relative z-[var(--z-index-above)] flex h-[70dvh] max-h-[70dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-[var(--bg-color-container)] shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${APP_OVERLAY_SAFE_BOTTOM_CLASS}`,
    sheetNoDrag,
  ].join(' '),
  panelVisible: 'translate-y-0',
  panelHidden: 'translate-y-full',
  header:
    'shrink-0 space-y-2.5 hairline-border-b border-[var(--border-color)] px-4 pb-3 pt-3',
  list: 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
  mentionOption:
    'flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm leading-snug text-[var(--text-color-primary)]',
  /** 未高亮行 hover（6%）；勿与高亮行同挂 */
  mentionOptionHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  /** 高亮行：与 hover 同档 6%（对齐 CwSelect） */
  mentionOptionKeyboard: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  mentionAvatarWrap:
    'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-color-secondarycomponent)] ring-1 ring-[var(--border-color)]',
  mentionAvatarImg: 'h-full w-full object-cover',
  mentionEmpty:
    'px-4 py-8 text-center text-sm text-[var(--text-color-secondary)]',
}

export default mentionSheetBase
