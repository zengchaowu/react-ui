import type {
  CalendarDisplayOptions,
  ChineseHolidayEntry,
} from '@zengchaowu/shared/functions/date/win11Calendar'

export interface CwCalendarProps {
  /** Highlight reference for today; default new Date() */
  today?: Date
  /** Browsed month (any day in month); v-model:viewMonth */
  viewMonth?: Date
  /** Selected day; v-model */
  value?: Date | null
  /** Show heading date + lunar line */
  showHeading?: boolean
  /** Show month navigation bar */
  showMonthBar?: boolean
  /** Collapse month panel */
  collapsed?: boolean
  /** Show collapse toggle */
  collapsible?: boolean
  showLunar?: boolean
  showSolarTerms?: boolean
  showChineseHolidays?: boolean
  /** API holidays keyed by YYYY-MM-DD */
  holidayByDate?: ReadonlyMap<string, ChineseHolidayEntry> | null
}

export type CwCalendarDisplayOptions = CalendarDisplayOptions

export interface CwCalendarEmits {
  onChange?: (value: Date | null) => void
  onUpdateViewMonth?: (value: Date) => void
  onUpdateCollapsed?: (value: boolean) => void
  onSelect?: (value: Date) => void
}
