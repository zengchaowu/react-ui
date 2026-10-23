/**
 * 应用 padding 到总尺寸
 */
export function applyPaddingToTotalSize(
  totalHeight: number,
  totalWidth: number,
  padding: { top: number; right: number; bottom: number; left: number }
): { totalHeight: number; totalWidth: number } {
  return {
    totalHeight: totalHeight + padding.top + padding.bottom,
    totalWidth: totalWidth + padding.left + padding.right
  }
}

