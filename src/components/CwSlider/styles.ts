import type { CwSliderStyles } from './types'
import { withInteractiveFocus } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const sliderBase: CwSliderStyles = {
  /**
   * w-64 默认宽；max-w-full min-w-0 使窄表单列内可收缩，避免撑出横向滚动条。
   * px-2.5 为拇指半宽留白（large=w-5），避免 0%/100% 时拇指溢出。
   */
  root: 'cw-slider inline-flex w-64 max-w-full min-w-0 select-none items-center gap-3 px-2.5',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 轨道
  track: 'relative w-full rounded bg-[var(--bg-color-component)] outline-none focus:outline-none',
  trackNormal: '',
  trackDisabled: 'bg-[var(--bg-color-component-disabled)] border-[var(--border-color)] cursor-not-allowed',
  trackReadonly: 'cursor-default',
  trackFocused: withInteractiveFocus('rounded'),

  // 进度条（基础 + 状态）
  fill: 'absolute left-0 top-0 rounded',
  fillNormal: 'bg-[var(--brand-color-6)]',
  fillReadonly: 'bg-[var(--brand-color-6)]',
  fillDisabled: 'bg-[var(--border-color)]',

  // 拇指：用 translate-x 居中，避免 left: calc(% - offset) 在两端溢出
  thumb: 'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-color-container)]',
  thumbNormal: '',
  thumbDisabled: '',
  thumbReadonly: '',

  // 标签
  label: 'select-none',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  // 尺寸样式：小
  sizeSmall: 'h-1.5 text-xs',
  // 尺寸样式：中
  sizeMedium: 'h-2 text-sm',
  // 尺寸样式：大
  sizeLarge: 'h-2.5 text-base'
}
