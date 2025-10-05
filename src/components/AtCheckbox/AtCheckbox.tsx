import React, { forwardRef } from 'react'
import { Checkbox as AntCheckbox } from 'antd'
import type { CheckboxProps } from 'antd'

export const AtCheckbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  return <AntCheckbox {...props} ref={ref} />
})

export default AtCheckbox