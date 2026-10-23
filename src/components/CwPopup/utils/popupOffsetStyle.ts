import type { CSSProperties } from 'react'

/** 未就绪时隐藏但仍参与布局/测量（不用 display:none，避免二次打开宽高为 0） */
export const POPUP_HIDDEN_STYLE: CSSProperties = {
  visibility: 'hidden',
  pointerEvents: 'none',
}

export function getValidOffsets(
  offsetX: number | null | undefined,
  offsetY: number | null | undefined,
): { x: number; y: number } | null {
  if (
    typeof offsetX === 'number' &&
    typeof offsetY === 'number' &&
    Number.isFinite(offsetX) &&
    Number.isFinite(offsetY)
  ) {
    return { x: offsetX, y: offsetY }
  }
  return null
}

/** 逻辑已打开且已有定位坐标（可对用户绘制） */
export function canPaintPopup(
  visible: boolean,
  offsetX: number | null | undefined,
  offsetY: number | null | undefined,
): boolean {
  return visible && getValidOffsets(offsetX, offsetY) != null
}

/**
 * 弹出层根节点样式。transform 必须由元素 style 持有，避免 React patch 时清空 JS 写入的 transform。
 */
export function buildPopupRootStyle(
  visible: boolean,
  offsetX: number | null | undefined,
  offsetY: number | null | undefined,
): CSSProperties {
  const offsets = getValidOffsets(offsetX, offsetY)
  const style: CSSProperties = offsets
    ? { transform: `translate(${Math.round(offsets.x)}px, ${Math.round(offsets.y)}px)` }
    : {}

  if (!canPaintPopup(visible, offsetX, offsetY)) {
    return { ...POPUP_HIDDEN_STYLE, ...style }
  }

  return style
}
