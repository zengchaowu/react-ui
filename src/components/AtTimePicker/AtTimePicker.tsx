import React from 'react'
import { TimePicker } from 'antd'
import type { TimePickerProps } from 'antd/es/time-picker'

const AtTimePicker: React.FC<TimePickerProps> = (props) => {
  return <TimePicker {...props} />
}

export default AtTimePicker