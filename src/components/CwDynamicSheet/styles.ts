import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import {
  APP_OVERLAY_SAFE_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS,
  APP_OVERLAY_SAFE_LEFT_CLASS,
  APP_OVERLAY_SAFE_RIGHT_CLASS,
  APP_OVERLAY_SAFE_TOP_CLASS,
} from '@zengchaowu/ui-shared/constants/appSafeAreaClasses'
import {
  CW_OVERLAY_ELECTRON_NO_DRAG_CLASS,
  CW_OVERLAY_HEADER_BAR_CLASS,
  CW_OVERLAY_SHEET_BODY_WITHOUT_HEADER_CLASS,
  CW_OVERLAY_SHEET_BODY_WITH_HEADER_CLASS,
  CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
} from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import type { CwDynamicSheetInnerStyles } from './types'

const sheetNoDrag = CW_OVERLAY_ELECTRON_NO_DRAG_CLASS

/** 库内 Sheet 壳层 class，不对外暴露为可覆盖 styles */
export const sheetBase: CwDynamicSheetInnerStyles = {
  overlay: [
    `cw-dynamic-sheet fixed inset-0 ${CW_OVERLAY_MODAL_Z_CLASS} transition-opacity duration-300`,
    sheetNoDrag,
  ].join(' '),
  overlayBottom: 'flex items-end',
  overlayTop: 'flex items-start',
  overlayLeft: 'flex items-center justify-start',
  overlayRight: 'flex items-center justify-end',
  backdrop: ['absolute inset-0 transition-opacity duration-300', sheetNoDrag].join(' '),
  backdropDefault: 'bg-[var(--mask-active)]',
  content: [
    'relative bg-[var(--bg-color-container)] shadow-xl overflow-hidden flex transition-transform duration-300',
    sheetNoDrag,
  ].join(' '),
  contentBottom: `w-full flex-col max-h-[90vh] ${APP_OVERLAY_SAFE_BOTTOM_CLASS}`,
  contentTop: `w-full flex-col max-h-[90vh] ${APP_OVERLAY_SAFE_TOP_CLASS}`,
  contentLeft: `h-full flex-col max-w-[90vw] ${APP_OVERLAY_SAFE_LEFT_CLASS}`,
  contentRight: `h-full flex-col max-w-[90vw] ${APP_OVERLAY_SAFE_RIGHT_CLASS}`,
  header: [CW_OVERLAY_HEADER_BAR_CLASS, sheetNoDrag].join(' '),
  closeButton: CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  closeButtonNormal: 'cursor-pointer',
  closeButtonHover: '',
  closeButtonFocused: CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
  closeIcon: '',
  bodyWithHeader: CW_OVERLAY_SHEET_BODY_WITH_HEADER_CLASS,
  bodyWithoutHeader: CW_OVERLAY_SHEET_BODY_WITHOUT_HEADER_CLASS,
  bodyAboveFooter: 'pb-2',
  footer: [
    `box-border flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 px-4 pt-2 hairline-border-t border-[var(--border-color)] ${APP_OVERLAY_SAFE_FOOTER_BOTTOM_CLASS}`,
    sheetNoDrag,
  ].join(' '),
  dragHandleContainer: [
    'flex shrink-0 justify-center px-4 pt-2 pb-1 touch-none',
    sheetNoDrag,
  ].join(' '),
  dragHandle:
    'h-1 w-10 shrink-0 rounded-full bg-[var(--border-color)]',
}
