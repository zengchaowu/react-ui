import React, { forwardRef } from 'react'
import { Input as AntInput } from 'antd'
import type { TextAreaProps } from 'antd/es/input'

export const AtTextArea = forwardRef<React.ElementRef<typeof AntInput.TextArea>, TextAreaProps>((props, ref) => {
  return <AntInput.TextArea {...props} ref={ref} />
})

export default AtTextArea