import { CW_OVERLAY_MODAL_Z_CLASS } from '../../constants/cwOverlayStack'
import { CW_OVERLAY_ELECTRON_NO_DRAG_CLASS } from '../../constants/cwOverlayHeaderTitle'
import { APP_OVERLAY_SAFE_BOTTOM_CLASS } from '../../constants/appSafeAreaClasses'
import type { CwMessageInputMentionSheetStyles } from './types'

const sheetNoDrag = CW_OVERLAY_ELECTRON_NO_DRAG_CLASS

export const defaultCwMessageInputMentionSheetStyles: CwMessageInputMentionSheetStyles = {
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
    'shrink-0 space-y-2.5 border-b border-[var(--border-color-extra-light)] px-4 pb-3 pt-3',
  list: 'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1',
  mentionOption:
    'flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm leading-snug text-[var(--text-color-primary)] active:bg-[var(--bg-color-component-hover)]',
  mentionOptionActive: 'bg-[var(--bg-color-secondarycontainer)]',
  mentionAvatarWrap:
    'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-color-secondarycomponent)] ring-1 ring-[var(--border-color-extra-light)]',
  mentionAvatarImg: 'h-full w-full object-cover',
  mentionEmpty:
    'px-4 py-8 text-center text-sm text-[var(--text-color-secondary)]',
}
