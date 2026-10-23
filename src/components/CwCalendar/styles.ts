import type { CwCalendarStyles } from './types'

/** Structural class hooks; visual rules live in cw-calendar.css */
export const calendarBase: CwCalendarStyles = {
  root: 'cw-calendar',
  header: 'cw-calendar__header',
  heading: 'cw-calendar__heading',
  date: 'cw-calendar__date',
  lunar: 'cw-calendar__lunar',
  calendarWrap: 'cw-calendar__wrap',
  calendarWrapCollapsed: 'cw-calendar__wrap--collapsed',
  calendar: 'cw-calendar__body',
  monthBar: 'cw-calendar__month-bar',
  monthLabel: 'cw-calendar__month-label',
  monthNav: 'cw-calendar__month-nav',
  weekdays: 'cw-calendar__weekdays',
  weekday: 'cw-calendar__weekday',
  grid: 'cw-calendar__grid',
  cell: 'cw-calendar__cell',
  cellMuted: 'cw-calendar__cell--muted',
  cellSelected: 'cw-calendar__cell--selected',
  cellDay: 'cw-calendar__cell-day',
  cellSub: 'cw-calendar__cell-sub',
  cellMark: 'cw-calendar__cell-mark',
  cellMarkRest: 'cw-calendar__cell-mark--rest',
  cellMarkWork: 'cw-calendar__cell-mark--work',
}
