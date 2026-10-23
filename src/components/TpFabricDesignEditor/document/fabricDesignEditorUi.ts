/** 工具栏图标按钮（Figma 风格：32px 触控区、无描边、选中浅底） */
export const FABRIC_EDITOR_ICON_BTN_CLASS =
  'inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-primary)] transition-[background-color,color] duration-150 hover:bg-[var(--bg-color-component-hover)] disabled:pointer-events-none disabled:opacity-35'

export const FABRIC_EDITOR_ICON_BTN_ACTIVE_CLASS =
  'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:!text-[var(--brand-color-6)]'

export const FABRIC_EDITOR_ICON_BTN_DANGER_CLASS =
  'hover:bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:text-[var(--error-color-6)]'

/** 与工作台首页分割线一致：`--border-color` */
export const FABRIC_EDITOR_TOOLBAR_DIVIDER_CLASS =
  'mx-1 h-5 w-px shrink-0 self-center bg-[var(--border-color)]'

/** 主工具栏功能组（Figma 式圆角底） */
export const FABRIC_EDITOR_TOOLBAR_GROUP_CLASS =
  'inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-page)] p-0.5'

export const FABRIC_EDITOR_TOOLBAR_GROUPS_ROW_CLASS =
  'flex min-h-10 flex-wrap items-center gap-2 px-3 py-1.5'

/** 属性条分区标签 */
export const FABRIC_EDITOR_CONTEXT_GROUP_LABEL_CLASS =
  'shrink-0 text-[var(--font-size-caption)] font-medium text-[var(--text-color-secondary)]'

export const FABRIC_EDITOR_CONTEXT_GROUP_CLASS =
  'inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-page)] px-2 py-1'

export const FABRIC_EDITOR_TOOLBAR_ICON_SIZE = 1

export const FABRIC_EDITOR_CONTEXT_INPUT_CLASS =
  'h-6 rounded border border-[var(--border-color)] bg-[var(--bg-color-container)] px-1.5 text-xs tabular-nums disabled:cursor-not-allowed'

export const FABRIC_EDITOR_CONTEXT_CHIP_BTN_CLASS =
  'inline-flex h-6 items-center rounded px-1.5 text-xs text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] disabled:cursor-not-allowed disabled:opacity-50'

export const FABRIC_EDITOR_CONTEXT_CHIP_BTN_ACTIVE_CLASS =
  'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:!text-[var(--brand-color-6)]'

/** 右侧属性面板紧凑数字框（CwNumberInput size=small）根 class */
export const FABRIC_EDITOR_INSPECTOR_NUMBER_ROOT_CLASS =
  'cw-number-input min-w-0 flex-1' as const

/** 右侧属性面板紧凑文本框（CwInput size=small）根 class */
export const FABRIC_EDITOR_INSPECTOR_INPUT_ROOT_CLASS = 'cw-input min-w-0 flex-1' as const

/** 右侧属性面板紧凑选择器（CwSelect size=small）根 class */
export const FABRIC_EDITOR_INSPECTOR_SELECT_ROOT_CLASS = 'cw-select min-w-0 flex-1' as const
