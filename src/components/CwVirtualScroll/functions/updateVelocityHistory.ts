/**
 * 更新速度历史记录
 */
export function updateVelocityHistory(
  history: Array<{ time: number; deltaY: number; deltaX: number }>,
  currentTime: number,
  currentScrollTop: number,
  currentScrollLeft: number,
): void {
  const lastHistory = history[history.length - 1]

  if (!lastHistory || currentTime - lastHistory.time >= 16) {
    history.push({
      time: currentTime,
      deltaY: currentScrollTop,
      deltaX: currentScrollLeft,
    })
    if (history.length > 3) {
      history.shift()
    }
  } else {
    if (history.length > 0) {
      const last = history[history.length - 1]
      last.time = currentTime
      last.deltaY = currentScrollTop
      last.deltaX = currentScrollLeft
    }
  }
}
