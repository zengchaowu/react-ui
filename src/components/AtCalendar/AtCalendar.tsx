import React from 'react'
import { Calendar } from 'antd'
import type { CalendarProps } from 'antd/es/calendar'

const AtCalendar: React.FC<CalendarProps<any>> = (props) => {
  return <Calendar {...props} />
}

export default AtCalendar