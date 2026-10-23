export type ScrollElementIntoCwDivViewportOptions = {
  /** `nearest`：仅在越界时滚动；`center`：尽量把目标滚到视口中间（打开下拉对准选中项） */
  block?: 'nearest' | 'center'
}

/**
 * 仅滚动最近的 `.cw-div__viewport`，避免 `scrollIntoView` 带动弹层 / 页面祖先。
 * 尊重元素 `scroll-margin`（frosted 选项 `scroll-my-1` 与 content `p-1` 对齐）。
 */
export function scrollElementIntoCwDivViewport(
  el: HTMLElement | null | undefined,
  options: ScrollElementIntoCwDivViewportOptions = {},
): void {
  if (!el) return
  const block = options.block ?? 'nearest'
  const viewport = el.closest('.cw-div__viewport') as HTMLElement | null
  if (!viewport) {
    el.scrollIntoView({
      block: block === 'center' ? 'center' : 'nearest',
      inline: 'nearest',
    })
    return
  }

  const style = getComputedStyle(el)
  const marginTop = parseFloat(style.scrollMarginTop) || 0
  const marginBottom = parseFloat(style.scrollMarginBottom) || 0
  const elRect = el.getBoundingClientRect()
  const vpRect = viewport.getBoundingClientRect()

  // 弹层未完成布局时视口高度为 0，稍后由调用方重试
  if (vpRect.height <= 0) return

  let delta = 0
  if (block === 'center') {
    const elCenter = (elRect.top + elRect.bottom) / 2
    const vpCenter = (vpRect.top + vpRect.bottom) / 2
    delta = elCenter - vpCenter
  } else if (elRect.bottom + marginBottom > vpRect.bottom) {
    delta = elRect.bottom + marginBottom - vpRect.bottom
  } else if (elRect.top - marginTop < vpRect.top) {
    delta = elRect.top - marginTop - vpRect.top
  }

  if (delta !== 0) {
    viewport.scrollTop += delta
  }
}
