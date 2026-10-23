import type { CwButtonAppearance } from '../CwButton/types'

/** CountDown 根容器内部 class */
export const countDownRootBase = 'cw-count-down-button inline-flex items-stretch select-none'
export const countDownRootBlock =
  'cw-count-down-button flex w-full min-w-0 justify-center select-none [&_.cw-button]:!w-full'

/** 默认：固定最小宽 + 居中，倒计时秒数变化时不晃 */
export const countDownLabelClass =
  'inline-block min-w-[4.625rem] text-center whitespace-nowrap tabular-nums'

/** 输入框后缀等紧凑贴右场景（inline-fixed / text-on-image） */
export const countDownLabelCompactEndClass =
  'inline-block whitespace-nowrap tabular-nums text-right'

const compactEndAppearances = new Set<CwButtonAppearance>([
  'inline-fixed',
  'text-on-image',
])

export function resolveCountDownLabelClass(appearance: CwButtonAppearance): string {
  return compactEndAppearances.has(appearance)
    ? countDownLabelCompactEndClass
    : countDownLabelClass
}
