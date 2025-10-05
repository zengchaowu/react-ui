import React, { forwardRef } from 'react'
import { InputNumber as AntInputNumber } from 'antd'
import type { InputNumberProps } from 'antd'

export const AtInputNumber = forwardRef<React.ElementRef<typeof AntInputNumber>, InputNumberProps>((props, ref) => {
  return <AntInputNumber {...props} ref={ref} />
})

export default AtInputNumber