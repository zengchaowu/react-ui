import {
  CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS,
  CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS,
  CW_OVERLAY_PREVIEW_DOWNLOAD_BUTTON_ROOT_CLASS,
} from '../constants/cwOverlayHeaderTitle'
import type { CwButtonAppearance } from '../components/CwButton/types'

/** 与 --size-overlay-icon（18px）一致 */
export const CW_OVERLAY_ICON_CLOSE_SIZE = 1.125

/** Dialog / Sheet / 预览关闭图标：class（配合 CwIcon :size） */
export const CW_OVERLAY_ICON_CLOSE_ICON_CLASS =
  'inline-flex items-center justify-center text-current'

/** @deprecated 使用 CW_OVERLAY_ICON_CLOSE_SIZE + CW_OVERLAY_ICON_CLOSE_ICON_CLASS */
export const CW_OVERLAY_ICON_CLOSE_ICON_STYLES = {
  root: CW_OVERLAY_ICON_CLOSE_ICON_CLASS,
  size: CW_OVERLAY_ICON_CLOSE_SIZE,
} as const

/** Dialog / Sheet / 预览关闭与下载钮统一用 overlay-icon appearance */
export const CW_OVERLAY_ICON_BUTTON_APPEARANCE = 'overlay-icon' as const satisfies CwButtonAppearance

export const CW_OVERLAY_ICON_BUTTON_FOCUS_CLASS = CW_OVERLAY_ICON_CLOSE_BUTTON_FOCUSED_CLASS

/** Dialog / Sheet 顶栏关闭钮布局 class（配合 appearance=overlay-icon） */
export function overlayDialogCloseButtonClass(
  rootClass: string = CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
): string {
  return rootClass
}

/** 全屏图库 / 附件预览独立关闭钮 */
export function overlayPreviewCloseButtonClass(): string {
  return CW_OVERLAY_PREVIEW_CLOSE_BUTTON_ROOT_CLASS
}

/** 全屏图库 / 附件预览右上角下载钮 */
export function overlayPreviewDownloadButtonClass(): string {
  return CW_OVERLAY_PREVIEW_DOWNLOAD_BUTTON_ROOT_CLASS
}

/** @deprecated 使用 CW_OVERLAY_ICON_BUTTON_APPEARANCE + overlayDialogCloseButtonClass */
export function createOverlayIconCloseButtonStyles(
  rootClass: string = CW_OVERLAY_DIALOG_CLOSE_BUTTON_ROOT_CLASS,
): { appearance: CwButtonAppearance; class: string } {
  return {
    appearance: CW_OVERLAY_ICON_BUTTON_APPEARANCE,
    class: overlayDialogCloseButtonClass(rootClass),
  }
}

/** @deprecated 使用 overlayPreviewCloseButtonClass */
export function createOverlayPreviewCloseButtonStyles(): {
  appearance: CwButtonAppearance
  class: string
} {
  return {
    appearance: CW_OVERLAY_ICON_BUTTON_APPEARANCE,
    class: overlayPreviewCloseButtonClass(),
  }
}

/** @deprecated 使用 overlayPreviewDownloadButtonClass */
export function createOverlayPreviewDownloadButtonStyles(): {
  appearance: CwButtonAppearance
  class: string
} {
  return {
    appearance: CW_OVERLAY_ICON_BUTTON_APPEARANCE,
    class: overlayPreviewDownloadButtonClass(),
  }
}
