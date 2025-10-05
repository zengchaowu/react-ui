import React, { forwardRef } from 'react'
import { Switch as AntSwitch } from 'antd'
import type { SwitchProps } from 'antd'

export const AtSwitch = forwardRef<HTMLButtonElement, SwitchProps>((props, ref) => {
  return <AntSwitch {...props} ref={ref} />
})

export default AtSwitch