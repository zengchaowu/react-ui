/** 带 border 的表单控件 wrapper 聚焦态（须 `!` 覆盖常态 border-color） */
export const FORM_CONTROL_FOCUS_CLASS = '!border-[var(--focus-ring)]'

/** 无独立边框的交互控件聚焦环（由组件在 :focus 等态叠加） */
export const INTERACTIVE_FOCUS_CLASS =
  'ring-1 ring-[var(--focus-ring)] ring-offset-0'

/** 菜单项等原生 focus-visible 场景 */
export const FOCUS_VISIBLE_INTERACTIVE_CLASS =
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-0'

/** 原生 input / select 的 :focus */
export const NATIVE_FOCUS_CLASS =
  'focus:outline-none focus:!border-[var(--focus-ring)]'

export function withInteractiveFocus(extra?: string): string {
  return [INTERACTIVE_FOCUS_CLASS, extra].filter(Boolean).join(' ')
}
