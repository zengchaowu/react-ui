/**
 * 计算桥接区域的尺寸（纯函数）
 * 桥接区域填充 trigger 和 popup 之间的空间，防止鼠标移动时弹窗消失
 *
 * @param triggerRect - 触发器元素的位置和大小
 * @param popupRect - 弹出层元素的位置和大小
 * @param placement - 弹出层的位置
 * @returns 桥接区域的 transform 和 size 样式
 */
export function calculateBridgeDimensions(
  triggerRect: DOMRect,
  popupRect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
): { transform: string; size: { width: string; height: string } } {
  let transform = 'translate(0px, 0px)'
  let size = { width: '0px', height: '0px' }

  if (placement === 'top') {
    const left = Math.round(Math.min(triggerRect.left, popupRect.left))
    const right = Math.round(Math.max(triggerRect.right, popupRect.right))
    const bottom = Math.round(popupRect.bottom)
    transform = `translate(${left}px, ${bottom}px)`
    size = {
      width: `${right - left}px`,
      height: `${Math.max(0, Math.round(triggerRect.top) - bottom)}px`,
    }
  } else if (placement === 'bottom') {
    const left = Math.round(Math.min(triggerRect.left, popupRect.left))
    const right = Math.round(Math.max(triggerRect.right, popupRect.right))
    const top = Math.round(triggerRect.bottom)
    transform = `translate(${left}px, ${top}px)`
    size = {
      width: `${right - left}px`,
      height: `${Math.max(0, Math.round(popupRect.top) - top)}px`,
    }
  } else if (placement === 'left') {
    const top = Math.round(Math.min(triggerRect.top, popupRect.top))
    const bottom = Math.round(Math.max(triggerRect.bottom, popupRect.bottom))
    const right = Math.round(popupRect.right)
    transform = `translate(${right}px, ${top}px)`
    size = {
      width: `${Math.max(0, Math.round(triggerRect.left) - right)}px`,
      height: `${bottom - top}px`,
    }
  } else if (placement === 'right') {
    const top = Math.round(Math.min(triggerRect.top, popupRect.top))
    const bottom = Math.round(Math.max(triggerRect.bottom, popupRect.bottom))
    const left = Math.round(triggerRect.right)
    transform = `translate(${left}px, ${top}px)`
    size = {
      width: `${Math.max(0, Math.round(popupRect.left) - left)}px`,
      height: `${bottom - top}px`,
    }
  }

  return { transform, size }
}
