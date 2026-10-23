/**
 * 表体纵向可滚动溢出量（px）。
 * 发丝线/亚像素取整常导致 1～2px 虚高，但系统滚动条并未真正出现。
 */
export function getVerticalScrollOverflow(element: HTMLElement | null): number {
  if (!element) return 0
  return Math.max(0, element.scrollHeight - element.clientHeight)
}

/** 亚像素与发丝线叠线容差；低于此阈值视为「无纵向滚动条」 */
export const VERTICAL_SCROLL_OVERFLOW_EPSILON = 2

/** 表体是否出现可感知的纵向滚动（溢出明显大于亚像素误差） */
export function hasVerticalScrollbar(element: HTMLElement | null): boolean {
  return getVerticalScrollOverflow(element) > VERTICAL_SCROLL_OVERFLOW_EPSILON
}

/**
 * 计算滚动条宽度（垂直滚动条）
 */
export function calculateScrollbarWidth(element: HTMLElement | null): number {
  if (!element) return 0

  if (hasVerticalScrollbar(element)) {
    const width = element.offsetWidth - element.clientWidth
    return width > 0 ? width : 0
  }

  return 0
}

/**
 * 计算表头对齐样式：仅补偿表体**右侧纵向滚动条**占位（padding-right），
 * 使表头列与表体内容区同宽。
 *
 * 表体底部的**横向滚动条**不应在表头上用 margin/padding 做垂直补偿：
 * 表头与表体是上下相邻的 flex 子项，负 margin 会把表体拽上去与表头重叠；
 * padding 又会在表头与首行之间多出一块空白。横向滚动只影响表体内部，与表头无此对齐需求。
 */
export function calculateHeaderAlignmentStyle(
  verticalScrollbarWidth: number,
): Record<string, string> {
  const style: Record<string, string> = {}

  if (verticalScrollbarWidth > 0) {
    style.paddingRight = `${verticalScrollbarWidth}px`
  }

  return style
}
