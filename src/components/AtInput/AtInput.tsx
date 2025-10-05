import React, { forwardRef } from 'react'
import { Input as AntInput } from 'antd'
import type { InputProps, InputRef } from 'antd'

export const AtInput = forwardRef<InputRef, InputProps>((props, ref) => {
  return <AntInput {...props} ref={ref} />
})

export default AtInput