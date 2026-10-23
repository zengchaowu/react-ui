/**
 * 应用 padding 到项目位置
 */
export function applyPaddingToItemPositions(
  itemPositions: Array<{ top: number; left: number; height: number; width: number }>,
  padding: { top: number; right: number; bottom: number; left: number }
): Array<{ top: number; left: number; height: number; width: number }> {
  return itemPositions.map(position => ({
    ...position,
    top: position.top + padding.top,
    left: position.left + padding.left
  }))
}

