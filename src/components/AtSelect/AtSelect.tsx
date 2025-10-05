import React, { forwardRef } from 'react'
import { Select as AntSelect } from 'antd'
import type { SelectProps } from 'antd'

export const AtSelect = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  return <AntSelect {...props} ref={ref} />
})

export default AtSelect