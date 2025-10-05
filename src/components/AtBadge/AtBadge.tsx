import React, { forwardRef } from 'react'
import { Badge as AntBadge } from 'antd'
import type { BadgeProps } from 'antd'

export const AtBadge = forwardRef<React.ElementRef<typeof AntBadge>, BadgeProps>((props, ref) => {
  return <AntBadge {...props} ref={ref} />
})

export default AtBadge