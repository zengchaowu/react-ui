/**
 * 检查并跳转到中间副本。
 * 上下触发带必须用 lead 隔开，避免「减一副本」后立刻落入「加一副本」区造成来回跳。
 */
function resolveLead(copySize: number, containerSize: number): number {
  if (copySize <= 0) return 0
  // 触发带取约 1/4 屏，且不超过副本 1/3。
  // 勿用整屏宽：分页画廊下会在「最后一页」全程触发跳转，拖拽基线错乱并导致指示器闪烁。
  const edge = Math.max(containerSize, 0) * 0.25
  return Math.min(edge, Math.floor(copySize / 3))
}

function jumpAxis(
  scroll: number,
  copySize: number,
  middleStart: number,
  middleEnd: number,
  containerSize: number,
): { needsUpdate: boolean; next: number } {
  if (copySize <= 0) {
    return { needsUpdate: false, next: scroll }
  }

  const lead = resolveLead(copySize, containerSize)
  let next = scroll
  let needsUpdate = false

  // 可能一次冲过多个副本，循环收敛到中间带附近
  for (let i = 0; i < 8; i += 1) {
    if (next >= middleEnd - lead) {
      next -= copySize
      needsUpdate = true
      continue
    }
    if (next < middleStart - lead) {
      next += copySize
      needsUpdate = true
      continue
    }
    break
  }

  return { needsUpdate, next }
}

export function checkAndJumpToMiddle(
  scrollTop: number,
  scrollLeft: number,
  direction: 'vertical' | 'horizontal' | 'both',
  singleCopyHeight: number,
  singleCopyWidth: number,
  middleCopyInfo: { top: number; left: number; topEnd: number; leftEnd: number } | null,
  containerHeight: number,
  containerWidth: number,
): { needsUpdate: boolean; newTop: number; newLeft: number } {
  if (!middleCopyInfo) {
    return { needsUpdate: false, newTop: scrollTop, newLeft: scrollLeft }
  }

  if (singleCopyHeight <= 0 && singleCopyWidth <= 0) {
    return { needsUpdate: false, newTop: scrollTop, newLeft: scrollLeft }
  }

  let needsUpdate = false
  let newTop = scrollTop
  let newLeft = scrollLeft

  if (direction === 'horizontal') {
    if (singleCopyWidth > 0) {
      const result = jumpAxis(
        scrollLeft,
        singleCopyWidth,
        middleCopyInfo.left,
        middleCopyInfo.leftEnd,
        containerWidth,
      )
      if (result.needsUpdate) {
        newLeft = result.next
        needsUpdate = true
      }
    }
  }

  if (direction === 'vertical' || direction === 'both') {
    if (singleCopyHeight > 0) {
      const result = jumpAxis(
        scrollTop,
        singleCopyHeight,
        middleCopyInfo.top,
        middleCopyInfo.topEnd,
        containerHeight,
      )
      if (result.needsUpdate) {
        newTop = result.next
        needsUpdate = true
      }
    }
  }

  return { needsUpdate, newTop, newLeft }
}
