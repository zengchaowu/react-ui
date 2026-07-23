import {
  CW_OVERLAY_MODAL_Z_CLASS,
  CW_OVERLAY_TOAST_Z_CLASS,
} from '../../constants/cwOverlayStack'
import {
  CW_OVERLAY_DIALOG_BODY_BASE_CLASS,
  CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  CW_OVERLAY_HEADER_BAR_CLASS,
  CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
} from '../../constants/cwOverlayHeaderTitle'
import type { CwDynamicDialogStyles } from './types'

export const defaultStyles: CwDynamicDialogStyles = {
  overlay: [
    `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} flex items-center justify-center transition-opacity duration-300 p-4`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  overlayVisible: 'opacity-100',
  overlayHidden: 'opacity-0',
  overlayFullscreen: [
    `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} flex flex-col transition-opacity duration-300`,
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  overlayToast: `cw-dynamic-dialog fixed inset-x-0 ${CW_OVERLAY_TOAST_Z_CLASS} box-border flex justify-center px-4 pointer-events-none transition-opacity duration-[250ms]`,
  overlayToastTop: 'top-[var(--toast-inset-top)]',
  overlayToastMiddle: 'top-1/2 -translate-y-1/2',
  overlayToastBottom: 'bottom-[var(--toast-inset-bottom)]',
  overlayHud: `cw-dynamic-dialog fixed inset-0 ${CW_OVERLAY_TOAST_Z_CLASS} flex items-center justify-center p-6 transition-opacity duration-200`,
  backdrop: 'absolute inset-0 transition-opacity duration-300',
  backdropDefault: 'bg-[var(--mask-active)]',
  backdropVisible: 'opacity-100',
  backdropHidden: 'opacity-0',
  backdropHiddenVariant: 'opacity-0 pointer-events-none',
  content: [
    'relative bg-[var(--bg-color-container)] rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col transition-opacity transition-transform duration-300',
    CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  ].join(' '),
  contentFullscreen:
    'absolute inset-0 z-[var(--z-index-above)] flex min-h-0 flex-col overflow-hidden bg-transparent shadow-none',
  contentToast:
    'pointer-events-auto w-fit max-w-[min(20rem,calc(100vw-2rem))] bg-transparent transition-opacity duration-[250ms]',
  contentHud:
    'relative z-[var(--z-index-above)] pointer-events-auto flex min-w-[7.5rem] max-w-[min(20rem,calc(100vw-3rem))] flex-col items-center gap-3 rounded-xl bg-[var(--bg-color-container)] px-8 py-6 shadow-[0_8px_32px_var(--overlay-scrim-strong)] ring-1 ring-[var(--overlay-scrim-soft)]',
  contentHudNoMask:
    'pointer-events-auto flex min-w-[7.5rem] max-w-[min(20rem,calc(100vw-3rem))] flex-col items-center gap-3',
  contentVisible: 'opacity-100 scale-100',
  contentHidden: 'opacity-0 scale-95',
  contentDraggable: 'transition-none',
  header: CW_OVERLAY_HEADER_BAR_CLASS,
  headerDraggable: 'cursor-move',
  closeButtonStandalone: CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS,
  closeButton: CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  closeButtonNormal: 'cursor-pointer',
  closeButtonHover: '',
  closeButtonFocused: CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
  closeIcon: '',
  body: CW_OVERLAY_DIALOG_BODY_BASE_CLASS,
}
