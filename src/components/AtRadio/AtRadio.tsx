import React, { forwardRef } from 'react'
import { Radio as AntRadio } from 'antd'
import type { RadioProps } from 'antd'

export const AtRadio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  return <AntRadio {...props} ref={ref} />
})

export default AtRadio