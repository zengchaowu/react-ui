/**
 * 计算速度（从历史记录中）
 */
export function calculateVelocity(
  history: Array<{ time: number; deltaY: number; deltaX: number }>,
): { velocityY: number; velocityX: number } {
  if (history.length < 2) return { velocityY: 0, velocityX: 0 }

  const last = history[history.length - 1]
  const secondLast = history[history.length - 2]
  const timeDelta = last.time - secondLast.time

  if (timeDelta <= 0) return { velocityY: 0, velocityX: 0 }

  const scrollDeltaY = last.deltaY - secondLast.deltaY
  const scrollDeltaX = last.deltaX - secondLast.deltaX
  const velocityY = (scrollDeltaY / timeDelta) * 16
  const velocityX = (scrollDeltaX / timeDelta) * 16

  return { velocityY, velocityX }
}
