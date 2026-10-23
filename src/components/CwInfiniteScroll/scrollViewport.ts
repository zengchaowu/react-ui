/** 距底部在此范围内视为「在底部」 */
export const VIEWPORT_BOTTOM_EPS_PX = 3

/** 将可滚动视口贴底（scrollTop = scrollHeight - clientHeight） */
export function scrollViewportToBottom(viewport: HTMLElement): void {
  viewport.scrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
}

export function isViewportAtBottom(
  viewport: HTMLElement,
  epsPx = VIEWPORT_BOTTOM_EPS_PX,
): boolean {
  const maxScroll = viewport.scrollHeight - viewport.clientHeight
  if (maxScroll <= 0) return true
  return maxScroll - viewport.scrollTop <= epsPx
}

export interface ScheduleScrollRetriesOptions {
  /** 额外 50/120ms 重试，应对图片等媒体撑高 */
  extendedRetries?: boolean
  /** 全部重试结束后的回调 */
  onComplete?: () => void
}

/**
 * 同步执行一次后，在微任务 / rAF 链上重复尝试滚动，
 * 用于 DOM 更新或布局尚未稳定时的贴底。
 */
export function scheduleScrollRetries(
  run: () => void,
  options?: ScheduleScrollRetriesOptions,
): void {
  const finish = () => options?.onComplete?.()
  run()
  queueMicrotask(() => {
    run()
    requestAnimationFrame(() => {
      run()
      requestAnimationFrame(() => {
        run()
        setTimeout(() => {
          run()
          if (options?.extendedRetries) {
            setTimeout(() => {
              run()
              setTimeout(() => {
                run()
                finish()
              }, 120)
            }, 50)
          } else {
            finish()
          }
        }, 0)
      })
    })
  })
}
