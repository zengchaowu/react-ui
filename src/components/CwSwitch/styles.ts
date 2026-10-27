import type { CwSwitchStyles } from '@zengchaowu/ui-shared/components/CwSwitch/types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const switchBase: CwSwitchStyles = {
  // 根容器
  root: 'cw-switch inline-flex items-center gap-2 select-none',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 轨道（focus 应显示在轨道上）
  track: 'relative inline-flex items-center rounded-full border-2 appearance-none outline-none transition-colors',
  trackNormal: 'bg-[var(--bg-color-component)] border-[var(--border-color)] cursor-pointer',
  trackChecked: 'bg-[var(--brand-color-6)] border-[var(--brand-color-6)] cursor-pointer',
  trackDisabled: 'bg-[var(--bg-color-component-disabled)] border-[var(--border-color)] cursor-not-allowed',
  trackReadonlyNormal: 'bg-[var(--bg-color-component)] border-[var(--border-color)] cursor-default',
  trackReadonlyChecked: 'bg-[var(--brand-color-6)] border-[var(--brand-color-6)] cursor-default',
  trackFocused: INTERACTIVE_FOCUS_CLASS,

  // 滑块
  thumb: 'absolute top-1/2 -translate-y-1/2 rounded-full transition-all bg-[var(--bg-color-container)]',
  thumbOff: 'left-0.5',
  thumbOn: '',
  thumbNormal: '',
  thumbDisabled: '',

  // 标签
  label: 'select-none',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  // 尺寸样式：小
  sizeSmall: 'w-7 h-4 text-xs',
  // 尺寸样式：中
  sizeMedium: 'w-9 h-5 text-sm',
  // 尺寸样式：大
  sizeLarge: 'w-11 h-6 text-base',
}
