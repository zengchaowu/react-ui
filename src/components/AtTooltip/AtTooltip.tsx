import React, { forwardRef } from 'react'
import { Tooltip as AntTooltip } from 'antd'
import type { TooltipProps } from 'antd'

export const AtTooltip = forwardRef<React.ElementRef<typeof AntTooltip>, TooltipProps>((props, ref) => {
  return <AntTooltip {...props} ref={ref} />
})

export default AtTooltip