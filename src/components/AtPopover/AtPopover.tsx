import React, { forwardRef } from 'react'
import { Popover as AntPopover } from 'antd'
import type { PopoverProps } from 'antd'

export const AtPopover = forwardRef<React.ElementRef<typeof AntPopover>, PopoverProps>((props, ref) => {
  return <AntPopover {...props} ref={ref} />
})

export default AtPopover