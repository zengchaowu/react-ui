import React, { forwardRef } from 'react'
import { DatePicker as AntDatePicker } from 'antd'
import type { DatePickerProps } from 'antd'

export const AtDatePicker = forwardRef<React.ElementRef<typeof AntDatePicker>, DatePickerProps>((props, ref) => {
  return <AntDatePicker {...props} ref={ref} />
})

export default AtDatePicker