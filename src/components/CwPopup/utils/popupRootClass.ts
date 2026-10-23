import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'

/** 会与 Popup 根节点 `fixed top-0 left-0` 冲突的定位类（含 fixed，避免重复/覆盖） */
const CONFLICTING_POSITION_CLASS =
  /\b(relative|absolute|static|sticky|fixed)\b/g

/** 调用方勿覆写 z-index；浮层顺序由 bringOverlayHostToFront + Scoped Portal DOM 序决定 */
const Z_INDEX_CLASS = /\bz-\[[^\]]+\]|\bz-\d+\b/g

const POPUP_ROOT_BASE_CLASS = `fixed top-0 left-0 pointer-events-auto ${CW_OVERLAY_MODAL_Z_CLASS}`

/**
 * 从调用方传入的 popup class 中剔除定位类。
 * Popup 根节点由 PopupContainer 统一为 fixed + translate 定位。
 */
export function sanitizePopupRootClass(styleClass: string): string {
  return styleClass
    .replace(CONFLICTING_POSITION_CLASS, '')
    .replace(Z_INDEX_CLASS, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 合并为 Popup 根节点完整 class */
export function buildPopupRootClass(styleClass: string): string {
  const sanitized = sanitizePopupRootClass(styleClass)
  return sanitized
    ? `${POPUP_ROOT_BASE_CLASS} ${sanitized}`
    : POPUP_ROOT_BASE_CLASS
}
