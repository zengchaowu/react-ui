import React, { forwardRef } from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps } from 'antd'

export const AtButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <AntButton {...props} ref={ref} />
})

export default AtButton