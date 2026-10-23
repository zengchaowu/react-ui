/**
 * 计算视口中间位置对应的项目索引
 */
export function calculateCenterIndex(
  scrollTop: number,
  scrollLeft: number,
  containerHeight: number,
  containerWidth: number,
  direction: 'vertical' | 'horizontal' | 'both',
  itemPositions: Array<{ top: number; left: number; height: number; width: number; originalIndex?: number }>,
  loopItems: Array<{ originalIndex: number }>
): number | null {
  if (itemPositions.length === 0 || loopItems.length === 0) {
    return null
  }

  // 视口尚无量测（多为首帧/遮罩未 layout）时，用 half 宽/高 去算会落在「第一个 slot」上，
  // 会误将 originalIndex 标成 0，上层（如 CwAttachmentGallery）会把 currentIndex 覆盖成 0，抵消 scrollToIndex(initial)。
  if (direction === 'horizontal' && containerWidth <= 0) {
    return null
  }
  if (direction === 'vertical' && containerHeight <= 0) {
    return null
  }
  if (direction === 'both' && (containerWidth <= 0 || containerHeight <= 0)) {
    return null
  }

  // 计算视口中间位置
  const centerTop = scrollTop + containerHeight / 2
  const centerLeft = scrollLeft + containerWidth / 2

  // 找到包含中间位置的项目
  let centerIndex: number | null = null

  if (direction === 'horizontal') {
    // 水平方向：找到包含 centerLeft 的项目
    for (let i = 0; i < itemPositions.length; i++) {
      const pos = itemPositions[i]
      if (centerLeft >= pos.left && centerLeft < pos.left + pos.width) {
        centerIndex = i
        break
      }
    }
    // 如果没找到，找最接近的项目
    if (centerIndex === null) {
      let minDistance = Infinity
      for (let i = 0; i < itemPositions.length; i++) {
        const pos = itemPositions[i]
        const itemCenter = pos.left + pos.width / 2
        const distance = Math.abs(centerLeft - itemCenter)
        if (distance < minDistance) {
          minDistance = distance
          centerIndex = i
        }
      }
    }
  } else if (direction === 'both') {
    // 双向：找到同时包含 centerTop 和 centerLeft 的项目
    for (let i = 0; i < itemPositions.length; i++) {
      const pos = itemPositions[i]
      if (
        centerTop >= pos.top &&
        centerTop < pos.top + pos.height &&
        centerLeft >= pos.left &&
        centerLeft < pos.left + pos.width
      ) {
        centerIndex = i
        break
      }
    }
    // 如果没找到，找最接近的项目（使用欧几里得距离）
    if (centerIndex === null) {
      let minDistance = Infinity
      for (let i = 0; i < itemPositions.length; i++) {
        const pos = itemPositions[i]
        const itemCenterTop = pos.top + pos.height / 2
        const itemCenterLeft = pos.left + pos.width / 2
        const distance = Math.sqrt(
          Math.pow(centerTop - itemCenterTop, 2) + Math.pow(centerLeft - itemCenterLeft, 2)
        )
        if (distance < minDistance) {
          minDistance = distance
          centerIndex = i
        }
      }
    }
  } else {
    // 垂直方向：找到包含 centerTop 的项目
    for (let i = 0; i < itemPositions.length; i++) {
      const pos = itemPositions[i]
      if (centerTop >= pos.top && centerTop < pos.top + pos.height) {
        centerIndex = i
        break
      }
    }
    // 如果没找到，找最接近的项目
    if (centerIndex === null) {
      let minDistance = Infinity
      for (let i = 0; i < itemPositions.length; i++) {
        const pos = itemPositions[i]
        const itemCenter = pos.top + pos.height / 2
        const distance = Math.abs(centerTop - itemCenter)
        if (distance < minDistance) {
          minDistance = distance
          centerIndex = i
        }
      }
    }
  }

  // 转换为原始索引
  if (centerIndex !== null && centerIndex < loopItems.length) {
    return loopItems[centerIndex]?.originalIndex ?? null
  }

  return null
}

