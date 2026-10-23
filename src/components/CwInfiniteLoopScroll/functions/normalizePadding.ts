/**
 * 规范化 padding 值
 * 将数字或对象格式的 padding 转换为统一的对象格式
 */
export function normalizePadding(
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined
): { top: number; right: number; bottom: number; left: number } {
  if (typeof padding === 'number') {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    }
  }
  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0
  }
}

