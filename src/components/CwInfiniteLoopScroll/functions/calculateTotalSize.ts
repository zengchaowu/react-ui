/**
 * 计算总高度
 */
export function calculateTotalHeight(
  direction: 'vertical' | 'horizontal' | 'both',
  containerHeight: number,
  defaultItemHeight: number,
  singleCopyHeight: number,
  copyCount: number
): number {
  if (direction === 'horizontal') {
    return containerHeight || defaultItemHeight
  }
  return singleCopyHeight * copyCount
}

/**
 * 计算总宽度
 */
export function calculateTotalWidth(
  direction: 'vertical' | 'horizontal' | 'both',
  containerWidth: number,
  defaultItemWidth: number,
  singleCopyWidth: number,
  copyCount: number
): number {
  if (direction === 'vertical') {
    return containerWidth || defaultItemWidth
  }
  if (direction === 'both') {
    return singleCopyWidth
  }
  return singleCopyWidth * copyCount
}

