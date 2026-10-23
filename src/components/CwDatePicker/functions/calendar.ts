import type { CwDatePickerCellData, CwDatePickerValueType } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number): Date {
  return new Date(toStartOfDay(date).getTime() + days * DAY_MS)
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  const currentDay = Math.min(date.getDate(), maxDay)
  return new Date(next.getFullYear(), next.getMonth(), currentDay)
}

export function addYears(date: Date, years: number): Date {
  const next = new Date(date.getFullYear() + years, date.getMonth(), 1)
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  const currentDay = Math.min(date.getDate(), maxDay)
  return new Date(next.getFullYear(), next.getMonth(), currentDay)
}

export function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

export function compareDate(left: Date, right: Date): number {
  const leftValue = toStartOfDay(left).getTime()
  const rightValue = toStartOfDay(right).getTime()
  if (leftValue === rightValue) return 0
  return leftValue > rightValue ? 1 : -1
}

export function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

export function formatDate(date: Date, format: string): string {
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  // 顺序：先长 token、日期 MM，再时间 HH/mm/ss（分钟必须用小写 mm，勿用 MM）
  return format
    .replace(/YYYY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds)
}

export function parseFormattedDate(value: string, format: string): Date | null {
  const escaped = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = escaped
    .replace(/YYYY/g, '(?<year>\\d{4})')
    .replace(/MM/g, '(?<month>\\d{1,2})')
    .replace(/DD/g, '(?<day>\\d{1,2})')
    .replace(/HH/g, '(?<hour>\\d{1,2})')
    .replace(/mm/g, '(?<minute>\\d{1,2})')
    .replace(/ss/g, '(?<second>\\d{1,2})')
  const match = new RegExp(`^${pattern}$`).exec(value)
  if (!match || !match.groups) return null

  const year = Number(match.groups.year)
  const month = Number(match.groups.month)
  const day = Number(match.groups.day)
  const hour = match.groups.hour != null ? Number(match.groups.hour) : 0
  const minute = match.groups.minute != null ? Number(match.groups.minute) : 0
  const second = match.groups.second != null ? Number(match.groups.second) : 0

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (
    !Number.isInteger(hour) || hour < 0 || hour > 23
    || !Number.isInteger(minute) || minute < 0 || minute > 59
    || !Number.isInteger(second) || second < 0 || second > 59
  ) {
    return null
  }

  const date = new Date(year, month - 1, day, hour, minute, second)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function parseModelValue(
  value: string | Date | number | null | undefined,
  format: string
): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return toStartOfDay(value)
  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : toStartOfDay(date)
  }
  if (typeof value === 'string') {
    return parseFormattedDate(value, format)
  }
  return null
}

export function serializeDate(
  date: Date | null,
  format: string,
  valueType: CwDatePickerValueType
): string | Date | number | null {
  if (!date) return null
  if (valueType === 'date') return new Date(date.getTime())
  if (valueType === 'timestamp') return date.getTime()
  return formatDate(date, format)
}

export function buildCalendarCells(viewDate: Date, firstDayOfWeek: 0 | 1): CwDatePickerCellData[] {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const weekday = firstDay.getDay()
  const normalizedWeekday = weekday === 0 ? 7 : weekday
  const offset = firstDayOfWeek === 1
    ? normalizedWeekday - 1
    : (weekday + 6) % 7

  const startDate = addDays(firstDay, -offset)
  const cells: CwDatePickerCellData[] = []

  for (let i = 0; i < 42; i += 1) {
    const current = addDays(startDate, i)
    cells.push({
      date: current,
      iso: formatDate(current, 'YYYY-MM-DD'),
      isCurrentMonth: isSameMonth(current, viewDate)
    })
  }

  return cells
}

export function getWeekdayLabels(weekdays: string[], firstDayOfWeek: 0 | 1): string[] {
  if (weekdays.length !== 7) return ['一', '二', '三', '四', '五', '六', '日']
  if (firstDayOfWeek === 1) return weekdays
  return [weekdays[6], ...weekdays.slice(0, 6)]
}

export function getMonthLabel(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function clampToWeekStart(date: Date, firstDayOfWeek: 0 | 1): Date {
  const weekday = date.getDay()
  const shift = firstDayOfWeek === 1 ? (weekday + 6) % 7 : weekday
  return addDays(date, -shift)
}

export function clampToWeekEnd(date: Date, firstDayOfWeek: 0 | 1): Date {
  return addDays(clampToWeekStart(date, firstDayOfWeek), 6)
}
