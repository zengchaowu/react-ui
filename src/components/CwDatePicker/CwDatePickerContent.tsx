import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwDatePickerContentFooter from './CwDatePickerContentFooter'
import { CwGrid } from '../CwGrid/CwGrid'
import { CwIcon } from '../CwIcon/CwIcon'
import type {
  CwDatePickerContentProps,
  CwDatePickerContentFooterShortcut,
  CwDatePickerModelValue,
  CwDatePickerRangeValue,
  CwDatePickerValue,
} from './types'
import { datePickerBase } from './styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwDatePicker/texts'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import {
  addDays,
  addMonths,
  addYears,
  buildCalendarCells,
  clampToWeekEnd,
  clampToWeekStart,
  compareDate,
  formatDate,
  getMonthEnd,
  getMonthLabel,
  getMonthStart,
  getWeekdayLabels,
  isSameDay,
  parseModelValue,
  serializeDate,
  toStartOfDay,
} from '@zengchaowu/ui-shared/components/CwDatePicker/functions'

export function CwDatePickerContent({
  value = null,
  range = false,
  disabled = false,
  readonly = false,
  size = 'medium',
  format = 'YYYY-MM-DD',
  valueType = 'string',
  firstDayOfWeek = 1,
  minDate = null,
  maxDate = null,
  disabledDate,
  showTodayButton = true,
  shortcuts = [],
  matchTriggerWidth = false,
  texts: textsProp,
  footerSlot,
  onUpdateModelValue,
  onChange,
  onRequestClose,
}: CwDatePickerContentProps) {
  const styles = datePickerBase
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const today = useMemo(() => toStartOfDay(new Date()), [])
  const parsedMinDate = useMemo(() => parseModelValue(minDate, format), [minDate, format])
  const parsedMaxDate = useMemo(() => parseModelValue(maxDate, format), [maxDate, format])
  const tabindex = disabled ? undefined : 0

  const [hasKeyboardInteracted, setHasKeyboardInteracted] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [internalRangeStart, setInternalRangeStart] = useState<Date | null>(null)
  const [internalRangeEnd, setInternalRangeEnd] = useState<Date | null>(null)

  const parsedSingleValue = useMemo(
    () => (range ? null : parseModelValue(value as CwDatePickerValue, format)),
    [range, value, format],
  )

  const parsedRangeValue = useMemo<[Date | null, Date | null]>(() => {
    if (!range || !Array.isArray(value)) return [null, null]
    const start = parseModelValue(value[0], format)
    const end = parseModelValue(value[1], format)
    return [start, end]
  }, [range, value, format])

  const [viewDate, setViewDate] = useState<Date>(
    () => parsedSingleValue ?? parsedRangeValue[0] ?? today,
  )
  const [cursorDate, setCursorDate] = useState<Date>(
    () => parsedSingleValue ?? parsedRangeValue[0] ?? today,
  )

  useEffect(() => {
    const target = parsedSingleValue ?? parsedRangeValue[0] ?? today
    setViewDate(target)
    setCursorDate(target)
    setInternalRangeStart(parsedRangeValue[0])
    setInternalRangeEnd(parsedRangeValue[1])
  }, [parsedSingleValue, parsedRangeValue, today])

  const panelLabel = getMonthLabel(viewDate)
  const weekdayLabels = getWeekdayLabels(texts.weekdays, firstDayOfWeek)
  const calendarCells = useMemo(
    () => buildCalendarCells(viewDate, firstDayOfWeek),
    [viewDate, firstDayOfWeek],
  )

  const panelSizeClass = (() => {
    if (matchTriggerWidth) return 'box-border w-full min-w-0'
    const sizeMap = {
      small: styles.panelSizeSmall,
      medium: styles.panelSizeMedium,
      large: styles.panelSizeLarge,
    }
    return sizeMap[size || 'medium']
  })()

  const cellSizeClass = {
    small: 'h-7 text-xs',
    medium: 'h-8 text-sm',
    large: 'h-10 text-base',
  }[size || 'medium']

  const normalizedShortcuts = useMemo<CwDatePickerContentFooterShortcut[]>(() => {
    if (shortcuts.length > 0) {
      return shortcuts
        .map((item) => {
          const rawValue = typeof item.value === 'function' ? item.value() : item.value
          return {
            label: item.label,
            value: parseModelValue(rawValue, format),
          }
        })
        .filter((item): item is CwDatePickerContentFooterShortcut => !!item.value)
    }
    return [
      { label: texts.today, value: today },
      { label: texts.thisMonthStart, value: getMonthStart(viewDate) },
      { label: texts.thisMonthEnd, value: getMonthEnd(viewDate) },
    ]
  }, [shortcuts, format, texts, today, viewDate])

  const isCellDisabled = (date: Date): boolean => {
    if (parsedMinDate && compareDate(date, parsedMinDate) < 0) return true
    if (parsedMaxDate && compareDate(date, parsedMaxDate) > 0) return true
    if (disabledDate && disabledDate(date)) return true
    return false
  }

  const normalizedRange = useMemo<[Date | null, Date | null]>(() => {
    const left = internalRangeStart
    const right = internalRangeEnd
    if (!left && !right) return [null, null]
    if (left && right) {
      return compareDate(left, right) <= 0
        ? [left, right]
        : [right, left]
    }
    return [left, right]
  }, [internalRangeStart, internalRangeEnd])

  const rangeStart = normalizedRange[0]
  const rangeEnd = normalizedRange[1]
  const isSelectingRangeEnd = range && !!rangeStart && !rangeEnd

  const orderedRange = (left: Date, right: Date): [Date, Date] => {
    return compareDate(left, right) <= 0 ? [left, right] : [right, left]
  }

  const previewRange = useMemo<[Date, Date] | null>(() => {
    if (!isSelectingRangeEnd || !rangeStart || !hoverDate) return null
    return orderedRange(rangeStart, hoverDate)
  }, [isSelectingRangeEnd, rangeStart, hoverDate])

  const isSelected = (date: Date): boolean => {
    if (range) {
      return (!!rangeStart && isSameDay(rangeStart, date))
        || (!!rangeEnd && isSameDay(rangeEnd, date))
    }
    return parsedSingleValue ? isSameDay(parsedSingleValue, date) : false
  }

  const isRangeStart = (date: Date): boolean => !!rangeStart && isSameDay(rangeStart, date)
  const isRangeEnd = (date: Date): boolean => {
    if (rangeEnd) return isSameDay(rangeEnd, date)
    if (isSelectingRangeEnd && hoverDate) return isSameDay(hoverDate, date)
    return false
  }

  const isInRange = (date: Date): boolean => {
    if (!range || !rangeStart) return false
    const activeRange = rangeEnd
      ? orderedRange(rangeStart, rangeEnd)
      : previewRange
    if (!activeRange) return false
    const [left, right] = activeRange
    return compareDate(date, left) > 0 && compareDate(date, right) < 0
  }

  const isFocusedCell = (date: Date): boolean => isSameDay(cursorDate, date)

  const isToday = (date: Date): boolean => isSameDay(today, date)

  const shouldApplyHover = (date: Date): boolean => {
    if (isCellDisabled(date)) return false
    if (range) {
      return !isRangeStart(date) && !isRangeEnd(date) && !isInRange(date)
    }
    return !isSelected(date)
  }

  const getHoverClass = (date: Date): string => {
    if (!shouldApplyHover(date)) return ''
    return styles.cellHover || 'hover:bg-[var(--bg-color-component-hover)]'
  }

  const getTodayClass = (date: Date): string => {
    if (!(isToday(date) && !isSelected(date))) return ''
    return styles.cellToday || 'border border-[var(--brand-color-6)]'
  }

  const getSelectedClass = (date: Date): string => {
    if (!(!range && isSelected(date))) return ''
    return styles.cellSelected || 'bg-[var(--brand-color-6)] !text-[var(--text-color-anti)]'
  }

  const getRangeClass = (date: Date): string => {
    if (!isInRange(date)) return ''
    return styles.cellRange || 'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)]'
  }

  const getRangeStartClass = (date: Date): string => {
    if (!isRangeStart(date)) return ''
    return styles.cellRangeStart || 'bg-[var(--brand-color-6)] !text-[var(--text-color-anti)]'
  }

  const getRangeEndClass = (date: Date): string => {
    if (!isRangeEnd(date)) return ''
    return styles.cellRangeEnd || 'bg-[var(--brand-color-6)] !text-[var(--text-color-anti)]'
  }

  const getFocusClass = (date: Date): string => {
    if (!(hasKeyboardInteracted && isFocusedCell(date) && !isCellDisabled(date))) return ''
    return styles.cellFocused || INTERACTIVE_FOCUS_CLASS
  }

  const emitSingleValue = (date: Date, closeAfterEmit: boolean) => {
    const serialized = serializeDate(date, format, valueType)
    onUpdateModelValue?.(serialized)
    onChange?.(serialized, date)
    if (closeAfterEmit) onRequestClose?.()
  }

  const emitRangeValue = (start: Date | null, end: Date | null, closeAfterEmit: boolean) => {
    setInternalRangeStart(start)
    setInternalRangeEnd(end)
    const serializedStart = serializeDate(start, format, valueType)
    const serializedEnd = serializeDate(end, format, valueType)
    const nextValue: CwDatePickerRangeValue = [serializedStart, serializedEnd]
    onUpdateModelValue?.(nextValue)

    if (start && end) {
      onChange?.(nextValue, [start, end])
    } else if (start) {
      onChange?.(nextValue, start)
    } else {
      onChange?.(nextValue, null)
    }

    if (closeAfterEmit) onRequestClose?.()
  }

  const handleDateSelect = (date: Date, closeAfterEmit = true) => {
    if (disabled || readonly) return
    if (isCellDisabled(date)) return

    if (!range) {
      emitSingleValue(date, closeAfterEmit)
      return
    }

    // 非受控（外部未回写 value）时以内部区间状态继续
    const start = parsedRangeValue[0] ?? internalRangeStart
    const end = parsedRangeValue[1] ?? internalRangeEnd
    if (!start || (start && end)) {
      emitRangeValue(date, null, false)
      setCursorDate(date)
      return
    }

    if (compareDate(date, start) < 0) {
      emitRangeValue(date, start, closeAfterEmit)
    } else {
      emitRangeValue(start, date, closeAfterEmit)
    }
  }

  const handleCellClick = (date: Date) => {
    handleDateSelect(date, true)
    setHoverDate(null)
  }

  const handleCellMouseEnter = (date: Date) => {
    if (!isSelectingRangeEnd) return
    if (isCellDisabled(date)) return
    setHoverDate(date)
  }

  const handleToday = () => {
    handleDateSelect(today, true)
  }

  const handleShortcut = (date: Date) => {
    setHoverDate(null)
    if (range) {
      emitRangeValue(date, date, true)
      return
    }
    handleDateSelect(date, true)
  }

  const goPrevMonth = () => {
    if (disabled || readonly) return
    setViewDate(addMonths(viewDate, -1))
  }

  const goNextMonth = () => {
    if (disabled || readonly) return
    setViewDate(addMonths(viewDate, 1))
  }

  const goPrevYear = () => {
    if (disabled || readonly) return
    setViewDate(addYears(viewDate, -1))
  }

  const goNextYear = () => {
    if (disabled || readonly) return
    setViewDate(addYears(viewDate, 1))
  }

  const moveCursor = (nextDate: Date) => {
    const normalized = toStartOfDay(nextDate)
    setCursorDate(normalized)
    if (
      normalized.getFullYear() !== viewDate.getFullYear()
      || normalized.getMonth() !== viewDate.getMonth()
    ) {
      setViewDate(normalized)
    }
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    setHasKeyboardInteracted(true)

    if (readonly) {
      if (
        event.key === 'Enter'
        || event.key === ' '
        || event.key === 'ArrowLeft'
        || event.key === 'ArrowRight'
        || event.key === 'ArrowUp'
        || event.key === 'ArrowDown'
      ) {
        event.preventDefault()
      }
      return
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleDateSelect(cursorDate, true)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveCursor(addDays(cursorDate, -1))
        break
      case 'ArrowRight':
        event.preventDefault()
        moveCursor(addDays(cursorDate, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        moveCursor(addDays(cursorDate, -7))
        break
      case 'ArrowDown':
        event.preventDefault()
        moveCursor(addDays(cursorDate, 7))
        break
      case 'PageUp':
        event.preventDefault()
        moveCursor(addMonths(cursorDate, -1))
        break
      case 'PageDown':
        event.preventDefault()
        moveCursor(addMonths(cursorDate, 1))
        break
      case 'Home':
        event.preventDefault()
        moveCursor(clampToWeekStart(cursorDate, firstDayOfWeek))
        break
      case 'End':
        event.preventDefault()
        moveCursor(clampToWeekEnd(cursorDate, firstDayOfWeek))
        break
      default:
        break
    }
  }

  const activateOnKey = (handler: () => void) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handler()
    }
  }

  const footerNode = footerSlot != null
    ? (typeof footerSlot === 'function'
      ? footerSlot({
        showTodayButton,
        shortcuts: normalizedShortcuts,
        todayText: texts.today,
        size,
        tabindex,
        onToday: handleToday,
        onShortcut: handleShortcut,
      })
      : footerSlot)
    : (
      <CwDatePickerContentFooter
        showTodayButton={showTodayButton}
        shortcuts={normalizedShortcuts}
        todayText={texts.today}
        size={size}
        tabindex={tabindex}
        onToday={handleToday}
        onShortcut={handleShortcut}
      />
    )

  return (
    <div
      className={[styles.panelInner, panelSizeClass].filter(Boolean).join(' ')}
      role="group"
      tabIndex={tabindex}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        <div className={styles.headerNav}>
          <div
            className={styles.headerYearButton}
            role="button"
            tabIndex={tabindex}
            aria-label={texts.prevYear}
            onClick={goPrevYear}
            onKeyDown={activateOnKey(goPrevYear)}
          >
            <CwIcon
              name="common--dir--double-left-line"
              prefix="icon"
              size={styles.prevIconStyles?.size ?? 1}
              className={styles.prevIconStyles?.class}
            />
          </div>
          <div
            className={styles.navButton}
            role="button"
            tabIndex={tabindex}
            aria-label={texts.prevMonth}
            onClick={goPrevMonth}
            onKeyDown={activateOnKey(goPrevMonth)}
          >
            <CwIcon
              name="common--dir--arrow-left-line"
              prefix="icon"
              size={styles.prevIconStyles?.size ?? 1}
              className={styles.prevIconStyles?.class}
            />
          </div>
        </div>
        <div className={styles.headerLabel}>{panelLabel}</div>
        <div className={styles.headerNav}>
          <div
            className={styles.navButton}
            role="button"
            tabIndex={tabindex}
            aria-label={texts.nextMonth}
            onClick={goNextMonth}
            onKeyDown={activateOnKey(goNextMonth)}
          >
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              size={styles.nextIconStyles?.size ?? 1}
              className={styles.nextIconStyles?.class}
            />
          </div>
          <div
            className={styles.headerYearButton}
            role="button"
            tabIndex={tabindex}
            aria-label={texts.nextYear}
            onClick={goNextYear}
            onKeyDown={activateOnKey(goNextYear)}
          >
            <CwIcon
              name="common--dir--double-right-line"
              prefix="icon"
              size={styles.nextIconStyles?.size ?? 1}
              className={styles.nextIconStyles?.class}
            />
          </div>
        </div>
      </div>

      <div className={styles.weekRow}>
        <CwGrid columns={7} gutter={4} rowGap={0}>
          {weekdayLabels.map((label) => (
            <div key={label} className={styles.weekCell}>
              {label}
            </div>
          ))}
        </CwGrid>
      </div>

      <div className={styles.bodyGrid} role="grid">
        <div className={styles.bodyGridInner}>
          <CwGrid columns={7} gutter={4} rowGap={4}>
            {calendarCells.map((cell) => (
              <div
                key={cell.iso}
                className={[
                  styles.cell,
                  cellSizeClass,
                  isCellDisabled(cell.date)
                    ? styles.cellDisabled
                    : (cell.isCurrentMonth ? styles.cellCurrentMonth : styles.cellOtherMonth),
                  getHoverClass(cell.date),
                  getTodayClass(cell.date),
                  getSelectedClass(cell.date),
                  getRangeClass(cell.date),
                  getRangeStartClass(cell.date),
                  getRangeEndClass(cell.date),
                  getFocusClass(cell.date),
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="gridcell"
                aria-selected={isSelected(cell.date) ? 'true' : 'false'}
                aria-disabled={isCellDisabled(cell.date) ? 'true' : 'false'}
                onClick={() => handleCellClick(cell.date)}
                onMouseEnter={() => handleCellMouseEnter(cell.date)}
              >
                {cell.date.getDate()}
              </div>
            ))}
          </CwGrid>
        </div>
      </div>

      {footerNode}
    </div>
  )
}

export default CwDatePickerContent
