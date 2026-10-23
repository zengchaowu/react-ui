/**
 * 计算垂直滚动条轨道样式
 */
export function calculateVerticalScrollbarTrackStyle(hasHorizontal: boolean): Record<string, string> {
  return {
    top: '0',
    left: '0',
    right: '0',
    bottom: hasHorizontal ? '9px' : '0',
  }
}

/**
 * 计算垂直滚动条滑块样式
 */
export function calculateVerticalScrollbarThumbStyle(
  thumbTop: number,
  thumbHeight: number,
  isHover: boolean,
  isDragging: boolean,
): Record<string, string> {
  const baseWidth = isHover || isDragging ? 8 : 6
  const offset = baseWidth / 2

  return {
    top: thumbTop + 'px',
    height: thumbHeight + 'px',
    width: baseWidth + 'px',
    left: `calc(50% - ${offset}px)`,
    transition: isDragging
      ? 'none'
      : 'background-color 0.2s ease, width 0.2s ease, height 0.2s ease',
  }
}

/**
 * 计算水平滚动条轨道样式
 */
export function calculateHorizontalScrollbarTrackStyle(hasVertical: boolean): Record<string, string> {
  return {
    left: '0',
    right: hasVertical ? '9px' : '0',
    bottom: '0',
    top: '0',
  }
}

/**
 * 计算水平滚动条滑块样式
 */
export function calculateHorizontalScrollbarThumbStyle(
  thumbLeft: number,
  thumbWidth: number,
  isHover: boolean,
  isDragging: boolean,
): Record<string, string> {
  const baseHeight = isHover || isDragging ? 8 : 6
  const offset = baseHeight / 2

  return {
    left: thumbLeft + 'px',
    top: `calc(50% - ${offset}px)`,
    width: thumbWidth + 'px',
    height: baseHeight + 'px',
    transition: isDragging
      ? 'none'
      : 'background-color 0.2s ease, height 0.2s ease, width 0.2s ease',
  }
}
