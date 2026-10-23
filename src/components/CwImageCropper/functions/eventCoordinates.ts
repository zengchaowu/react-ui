/**
 * 从鼠标或触摸事件中获取坐标
 */
export function getEventCoordinates(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
  if ('touches' in e && e.touches.length > 0) {
    return {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY
    }
  } else if ('changedTouches' in e && e.changedTouches.length > 0) {
    return {
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY
    }
  } else {
    const mouseEvent = e as MouseEvent
    return {
      clientX: mouseEvent.clientX,
      clientY: mouseEvent.clientY
    }
  }
}
