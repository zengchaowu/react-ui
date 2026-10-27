import {
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react'
import CwButton from '../CwButton/CwButton'
import CwGrid from '../CwGrid/CwGrid'
import CwIcon from '../CwIcon/CwIcon'
import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthCells,
  formatFlyoutDateHeading,
  formatLunarFullLabel,
  formatMonthYearLabel,
  isSameDay,
  type CalendarCell,
} from '@zengchaowu/shared/functions/date/win11Calendar'
import type { CwCalendarEmits, CwCalendarProps } from './types'
import { calendarBase } from '@zengchaowu/ui-shared/components/CwCalendar/styles'
import './cw-calendar.css'

export interface CwCalendarComponentProps
  extends CwCalendarProps,
    CwCalendarEmits,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'className' | 'children' | 'onChange' | 'onSelect'
    > {
  className?: string
}

export function CwCalendar({
  today,
  viewMonth,
  value = null,
  showHeading = true,
  showMonthBar = true,
  collapsed = false,
  collapsible = false,
  showLunar = true,
  showSolarTerms = true,
  showChineseHolidays = false,
  holidayByDate,
  className,
  onChange,
  onUpdateViewMonth,
  onUpdateCollapsed,
  onSelect,
  ...rest
}: CwCalendarComponentProps) {
  const styles = calendarBase

  const todayRef = useMemo(() => today ?? new Date(), [today])
  const [innerViewMonth, setInnerViewMonth] = useState(() => {
    const initial = viewMonth ?? todayRef
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })

  useEffect(() => {
    if (!viewMonth) return
    setInnerViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1))
  }, [viewMonth])

  const setViewMonth = (next: Date) => {
    const normalized = new Date(next.getFullYear(), next.getMonth(), 1)
    setInnerViewMonth(normalized)
    onUpdateViewMonth?.(normalized)
  }

  const displayOptions = useMemo(
    () => ({
      showLunar,
      showSolarTerms,
      showChineseHolidays,
      holidayByDate: holidayByDate ?? undefined,
    }),
    [showLunar, showSolarTerms, showChineseHolidays, holidayByDate],
  )

  const heading = useMemo(
    () => formatFlyoutDateHeading(todayRef),
    [todayRef],
  )
  const lunarHeading = useMemo(
    () => (showLunar ? formatLunarFullLabel(todayRef) : ''),
    [showLunar, todayRef],
  )
  const monthLabel = useMemo(
    () => formatMonthYearLabel(innerViewMonth),
    [innerViewMonth],
  )
  const cells = useMemo(
    () => buildMonthCells(innerViewMonth, todayRef, displayOptions),
    [innerViewMonth, todayRef, displayOptions],
  )

  function prevMonth() {
    setViewMonth(addMonths(innerViewMonth, -1))
  }

  function nextMonth() {
    setViewMonth(addMonths(innerViewMonth, 1))
  }

  function toggleCollapsed() {
    onUpdateCollapsed?.(!collapsed)
  }

  function isSelected(cell: CalendarCell) {
    return value != null && isSameDay(cell.date, value)
  }

  function handleSelect(cell: CalendarCell) {
    onChange?.(cell.date)
    onSelect?.(cell.date)
  }

  function holidayMarkLabel(mark: CalendarCell['holidayMark']) {
    if (mark === 'rest') return '\u4f11'
    if (mark === 'work') return '\u73ed'
    return ''
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div {...rest} className={rootClassName} role="group" aria-label={'\u65e5\u5386'}>
      {showHeading || collapsible ? (
        <header className={styles.header}>
          {showHeading ? (
            <div className={styles.heading}>
              <p className={styles.date}>{heading}</p>
              {lunarHeading ? (
                <p className={styles.lunar}>{lunarHeading}</p>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          {collapsible ? (
            <CwButton
              appearance="icon"
              variant="text"
              aria-label={
                collapsed
                  ? '\u5c55\u5f00\u65e5\u5386'
                  : '\u6536\u8d77\u65e5\u5386'
              }
              aria-expanded={!collapsed}
              onClick={toggleCollapsed}
            >
              <CwIcon
                name={
                  collapsed
                    ? 'common--dir--arrow-up-line'
                    : 'common--dir--arrow-down-line'
                }
                size={1}
              />
            </CwButton>
          ) : null}
        </header>
      ) : null}

      <div
        className={[
          styles.calendarWrap,
          collapsed ? styles.calendarWrapCollapsed : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.calendar}>
          {showMonthBar ? (
            <div className={styles.monthBar}>
              <span className={styles.monthLabel}>{monthLabel}</span>
              <div className={styles.monthNav}>
                <CwButton
                  appearance="icon"
                  variant="text"
                  aria-label={'\u4e0a\u4e00\u4e2a\u6708'}
                  onClick={prevMonth}
                >
                  <CwIcon name="common--dir--arrow-up-line" size={0.875} />
                </CwButton>
                <CwButton
                  appearance="icon"
                  variant="text"
                  aria-label={'\u4e0b\u4e00\u4e2a\u6708'}
                  onClick={nextMonth}
                >
                  <CwIcon name="common--dir--arrow-down-line" size={0.875} />
                </CwButton>
              </div>
            </div>
          ) : null}

          <CwGrid
            columns={7}
            gutter={0}
            rowGap={0}
            align="stretch"
            className={styles.weekdays}
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className={styles.weekday}>
                {label}
              </span>
            ))}
          </CwGrid>

          <CwGrid
            columns={7}
            gutter={0}
            rowGap={0}
            align="stretch"
            className={styles.grid}
            role="grid"
          >
            {cells.map((cell) => (
              <CwButton
                key={cell.date.toISOString()}
                variant={cell.isToday || isSelected(cell) ? 'solid' : 'text'}
                type={cell.isToday || isSelected(cell) ? 'primary' : 'default'}
                shape="circle"
                className={[
                  styles.cell,
                  !cell.inCurrentMonth && !cell.isToday
                    ? styles.cellMuted
                    : '',
                  cell.isToday || isSelected(cell)
                    ? styles.cellSelected
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="gridcell"
                aria-current={cell.isToday ? 'date' : undefined}
                onClick={() => handleSelect(cell)}
              >
                {cell.holidayMark ? (
                  <span
                    className={[
                      styles.cellMark,
                      cell.holidayMark === 'rest'
                        ? styles.cellMarkRest
                        : styles.cellMarkWork,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {holidayMarkLabel(cell.holidayMark)}
                  </span>
                ) : null}
                <span className={styles.cellDay}>{cell.day}</span>
                {cell.subLabel ? (
                  <span className={styles.cellSub}>{cell.subLabel}</span>
                ) : null}
              </CwButton>
            ))}
          </CwGrid>
        </div>
      </div>
    </div>
  )
}

export default CwCalendar
