import type { CwSliderStyles } from './types'
import { withInteractiveFocus } from '../../utils/focusStyles'

export const defaultStyles: CwSliderStyles = {
  // 根容器（不聚焦）
  root: 'cw-slider inline-flex items-center gap-3 select-none w-64',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 轨道
  track: 'relative w-full rounded bg-[var(--bg-color-component)] outline-none focus:outline-none',
  trackNormal: '',
  trackDisabled: 'bg-[var(--bg-color-component-disabled)] border-[var(--component-border)] cursor-not-allowed',
  trackReadonly: 'cursor-default',
  trackFocused: withInteractiveFocus('rounded'),

  // 进度条（基础 + 状态）
  fill: 'absolute left-0 top-0 rounded',
  fillNormal: 'bg-[var(--brand-color-6)]',
  fillReadonly: 'bg-[var(--brand-color-6)]',
  fillDisabled: 'bg-[var(--component-border)]',

  // 拇指
  thumb: 'absolute top-1/2 -translate-y-1/2 rounded-full bg-[var(--bg-color-container)] border-2 border-[var(--component-border)]',
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


