/**
 * 计算项目位置
 */
export function calculateItemPositions(
  loopItems: Array<{
    key: string | number
    index: number
    originalIndex: number
    height?: number
    width?: number
  }>,
  direction: 'vertical' | 'horizontal' | 'both',
  defaultItemHeight: number,
  defaultItemWidth: number,
): Array<{
  key: string | number
  index: number
  originalIndex: number
  top: number
  left: number
  height: number
  width: number
}> {
  const positions: Array<{
    key: string | number
    index: number
    originalIndex: number
    top: number
    left: number
    height: number
    width: number
  }> = []

  if (direction === 'horizontal') {
    let currentLeft = 0
    loopItems.forEach((item) => {
      const width = item.width ?? defaultItemWidth
      positions.push({
        key: item.key,
        index: item.index,
        originalIndex: item.originalIndex,
        top: 0,
        left: currentLeft,
        height: item.height ?? defaultItemHeight,
        width,
      })
      currentLeft += width
    })
  } else if (direction === 'both') {
    let currentTop = 0
    loopItems.forEach((item) => {
      const height = item.height ?? defaultItemHeight
      positions.push({
        key: item.key,
        index: item.index,
        originalIndex: item.originalIndex,
        top: currentTop,
        left: 0,
        height,
        width: item.width ?? defaultItemWidth,
      })
      currentTop += height
    })
  } else {
    let currentTop = 0
    loopItems.forEach((item) => {
      const height = item.height ?? defaultItemHeight
      positions.push({
        key: item.key,
        index: item.index,
        originalIndex: item.originalIndex,
        top: currentTop,
        left: 0,
        height,
        width: item.width ?? defaultItemWidth,
      })
      currentTop += height
    })
  }

  return positions
}
