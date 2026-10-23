/**
 * 计算滚轮事件的滚动增量
 */
export function calculateWheelDelta(
  deltaY: number,
  deltaX: number,
  direction: 'vertical' | 'horizontal' | 'both',
): { deltaTop: number; deltaLeft: number } {
  if (direction === 'horizontal') {
    const delta = deltaX || deltaY
    return {
      deltaTop: 0,
      deltaLeft: delta,
    }
  } else if (direction === 'both') {
    return {
      deltaTop: deltaY,
      deltaLeft: deltaX,
    }
  } else {
    return {
      deltaTop: deltaY,
      deltaLeft: 0,
    }
  }
}
