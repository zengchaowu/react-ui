/**
 * 计算总高度
 */
export function calculateTotalHeight(
  itemPositions: Array<{ top: number; height: number }>,
  direction: 'vertical' | 'horizontal' | 'both',
  containerHeight: number,
  defaultItemHeight: number,
): number {
  if (itemPositions.length === 0) return 0
  if (direction === 'horizontal') {
    return containerHeight || defaultItemHeight
  }
  const lastItem = itemPositions[itemPositions.length - 1]
  return lastItem.top + lastItem.height
}

/**
 * 计算总宽度
 */
export function calculateTotalWidth(
  itemPositions: Array<{ left: number; width: number }>,
  direction: 'vertical' | 'horizontal' | 'both',
  containerWidth: number,
  defaultItemWidth: number,
): number {
  if (itemPositions.length === 0) return 0
  if (direction === 'vertical') {
    return containerWidth || defaultItemWidth
  }
  // 对于 'horizontal' 和 'both'，都需要计算所有项目的总宽度
  const lastItem = itemPositions[itemPositions.length - 1]
  return lastItem.left + lastItem.width
}
