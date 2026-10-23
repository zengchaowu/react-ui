/** 把滚动位置折回一份循环内容里。 */
export function loopCopyOffset(scroll: number, copySize: number) {
  if (!(copySize > 0)) return 0
  return ((scroll % copySize) + copySize) % copySize
}

/** 一份内容比视口更高时，返回滑块要用的尺寸和偏移。 */
export function loopScrollbarSpan(scroll: number, copySize: number, clientSize: number) {
  if (!(copySize > clientSize + 1)) return undefined
  return {
    extent: copySize,
    offset: loopCopyOffset(scroll, copySize),
  }
}
