/**
 * 计算实际使用的副本数量
 */
export function calculateCopyCount(
  itemsLength: number,
  direction: 'vertical' | 'horizontal' | 'both',
  containerHeight: number,
  containerWidth: number,
  singleCopyHeight: number,
  singleCopyWidth: number
): number {
  if (itemsLength === 0) return 0

  let minCopies = 3
  if (direction === 'horizontal') {
    if (containerWidth > 0 && singleCopyWidth > 0) {
      const neededCopies = Math.ceil(containerWidth / singleCopyWidth)
      // 两侧各留一整屏副本，避免中间带贴在 max scroll 上，一收敛就冲到最右/最下
      minCopies = Math.max(minCopies, neededCopies * 2 + 1)
    }
  } else if (containerHeight > 0 && singleCopyHeight > 0) {
    const neededCopies = Math.ceil(containerHeight / singleCopyHeight)
    minCopies = Math.max(minCopies, neededCopies * 2 + 1)
  }

  // 确保至少是奇数，这样中间副本的位置更明确
  if (minCopies % 2 === 0) {
    minCopies += 1
  }

  return minCopies
}

