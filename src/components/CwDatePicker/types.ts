import type { CwInputTexts } from '../CwInput/types'
import type { CwPopupStyles } from '../CwPopup/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export type CwDatePickerValueType = 'string' | 'date' | 'timestamp'
export type CwDatePickerValue = string | Date | number | null
export type CwDatePickerRangeValue = [CwDatePickerValue, CwDatePickerValue]
export type CwDatePickerModelValue = CwDatePickerValue | CwDatePickerRangeValue

export interface CwDatePickerShortcut {
  label: string
  value: Date | string | number | (() => Date | string | number)
}

export interface CwDatePickerCellData {
  date: Date
  iso: string
  isCurrentMonth: boolean
}

export interface CwDatePickerProps {
  modelValue?: CwDatePickerModelValue
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
  styles?: Partial<CwDatePickerStyles>
  texts?: Partial<CwDatePickerTexts>
}

export interface CwDatePickerContentProps {
  modelValue?: CwDatePickerModelValue
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
  styles?: Partial<CwDatePickerStyles>
  texts?: Partial<CwDatePickerTexts>
}

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
  popupStyles?: Partial<CwPopupStyles>
  clearIconStyles?: CwIconEmbed
  calendarIconStyles?: CwIconEmbed
  prevIconStyles?: CwIconEmbed
  nextIconStyles?: CwIconEmbed
}

export interface CwDatePickerTexts {
  placeholder: string
  rangePlaceholderStart: string
  rangePlaceholderEnd: string
  rangeSeparator: string
  clear: string
  today: string
  thisMonthStart: string
  thisMonthEnd: string
  prevMonth: string
  nextMonth: string
  prevYear: string
  nextYear: string
  openPanel: string
  weekdays: string[]
  inputTexts?: Partial<CwInputTexts>
}

export interface CwDatePickerEmits {
  'update:modelValue': [value: CwDatePickerModelValue]
  'change': [value: CwDatePickerModelValue, date: Date | [Date, Date] | null]
  'clear': []
  'visibleChange': [visible: boolean]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}

export interface CwDatePickerContentEmits {
  'update:modelValue': [value: CwDatePickerModelValue]
  'change': [value: CwDatePickerModelValue, date: Date | [Date, Date] | null]
  'requestClose': []
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
  styles?: Partial<Pick<CwDatePickerStyles,
    'footer' | 'footerLeft' | 'footerRight' | 'footerButton' |
    'footerButtonSizeSmall' | 'footerButtonSizeMedium' | 'footerButtonSizeLarge' |
    'shortcuts' | 'shortcutButton' |
    'shortcutButtonSizeSmall' | 'shortcutButtonSizeMedium' | 'shortcutButtonSizeLarge'>>
}

export interface CwDatePickerContentFooterEmits {
  today: []
  shortcut: [date: Date]
}
