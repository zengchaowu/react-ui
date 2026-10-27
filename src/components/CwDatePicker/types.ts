import type { HTMLAttributes, ReactNode } from 'react'

import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwDatePickerTexts } from '@zengchaowu/ui-shared/components/CwDatePicker/types'
import type { CwDatePickerValueType } from '@zengchaowu/ui-shared/components/CwDatePicker/types'

export type CwDatePickerValue = string | Date | number | null
export type CwDatePickerRangeValue = [CwDatePickerValue, CwDatePickerValue]
export type CwDatePickerModelValue = CwDatePickerValue | CwDatePickerRangeValue

export interface CwDatePickerShortcut {
  label: string
  value: Date | string | number | (() => Date | string | number)
}

export interface CwDatePickerProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onChange' | 'onFocus' | 'onBlur'
  > {
  /** 受控值（Vue `modelValue`） */
  value?: CwDatePickerModelValue
  placeholder?: string
  rangePlaceholder?: [string, string]
  range?: boolean
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  size?: 'small' | 'medium' | 'large'
  format?: string
  valueType?: CwDatePickerValueType
  firstDayOfWeek?: 0 | 1
  minDate?: string | Date | number | null
  maxDate?: string | Date | number | null
  disabledDate?: (date: Date) => boolean
  showTodayButton?: boolean
  shortcuts?: CwDatePickerShortcut[]
  popupClass?: string
  popupTriggerClass?: string
  texts?: Partial<CwDatePickerTexts>
  className?: string
  /** 值变化（合并 Vue `update:modelValue` 与 `change`） */
  onChange?: (
    value: CwDatePickerModelValue,
    date: Date | [Date, Date] | null,
  ) => void
  /** 清除 */
  onClear?: () => void
  /** 弹层显隐变化 */
  onVisibleChange?: (visible: boolean) => void
  /** 聚焦 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦 */
  onBlur?: (event: FocusEvent) => void
}

export interface CwDatePickerContentProps {
  value?: CwDatePickerModelValue
  range?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  format?: string
  valueType?: CwDatePickerValueType
  firstDayOfWeek?: 0 | 1
  minDate?: string | Date | number | null
  maxDate?: string | Date | number | null
  disabledDate?: (date: Date) => boolean
  showTodayButton?: boolean
  shortcuts?: CwDatePickerShortcut[]
  /** 为 true 时面板宽度跟随 trigger（用于 CwDatePicker 弹层） */
  matchTriggerWidth?: boolean
  texts?: Partial<CwDatePickerTexts>
  /** 页脚具名插槽（作用域插槽以 render prop 形式提供） */
  footerSlot?: CwDatePickerContentFooterSlot
  onUpdateModelValue?: (value: CwDatePickerModelValue) => void
  onChange?: (
    value: CwDatePickerModelValue,
    date: Date | [Date, Date] | null,
  ) => void
  onRequestClose?: () => void
}

/** @internal */
export interface CwDatePickerStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  trigger: string
  suffix: string
  clearButton: string
  panel: string
  panelInner: string
  header: string
  headerNav: string
  headerLabel: string
  headerYearButton: string
  navButton: string
  weekRow: string
  weekCell: string
  bodyGrid: string
  bodyGridInner: string
  cell: string
  cellCurrentMonth: string
  cellOtherMonth: string
  cellToday: string
  cellSelected: string
  cellRange: string
  cellRangeStart: string
  cellRangeEnd: string
  cellDisabled: string
  cellFocused: string
  cellHover: string
  footer: string
  footerLeft: string
  footerRight: string
  footerButton: string
  footerButtonSizeSmall: string
  footerButtonSizeMedium: string
  footerButtonSizeLarge: string
  shortcuts: string
  shortcutButton: string
  shortcutButtonSizeSmall: string
  shortcutButtonSizeMedium: string
  shortcutButtonSizeLarge: string
  panelSizeSmall: string
  panelSizeMedium: string
  panelSizeLarge: string
  sizeSmall?: string
  sizeMedium?: string
  sizeLarge?: string
  clearIconStyles?: CwIconEmbed
  calendarIconStyles?: CwIconEmbed
  prevIconStyles?: CwIconEmbed
  nextIconStyles?: CwIconEmbed
}

/** 默认底部快捷项（用于 CwDatePickerContentFooter） */
export interface CwDatePickerContentFooterShortcut {
  label: string
  value: Date
}

export interface CwDatePickerContentFooterProps {
  showTodayButton?: boolean
  shortcuts?: CwDatePickerContentFooterShortcut[]
  todayText?: string
  size?: 'small' | 'medium' | 'large'
  tabindex?: number
  onToday?: () => void
  onShortcut?: (date: Date) => void
}

/** 页脚作用域插槽参数（Vue `#footer` slot props） */
export interface CwDatePickerContentFooterSlotProps {
  showTodayButton: boolean
  shortcuts: CwDatePickerContentFooterShortcut[]
  todayText: string
  size: 'small' | 'medium' | 'large'
  tabindex?: number
  onToday: () => void
  onShortcut: (date: Date) => void
}

export type CwDatePickerContentFooterSlot =
  | ReactNode
  | ((slotProps: CwDatePickerContentFooterSlotProps) => ReactNode)

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDatePickerContentEmits {
  'update:modelValue': [value: CwDatePickerModelValue]
  'change': [value: CwDatePickerModelValue, date: Date | [Date, Date] | null]
  'requestClose': []
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDatePickerContentFooterEmits {
  today: []
  shortcut: [date: Date]
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDatePickerEmits {
  'update:modelValue': [value: CwDatePickerModelValue]
  'change': [value: CwDatePickerModelValue, date: Date | [Date, Date] | null]
  'clear': []
  'visibleChange': [visible: boolean]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}
