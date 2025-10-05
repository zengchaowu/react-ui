import React, { forwardRef } from 'react'
import { Tag as AntTag } from 'antd'
import type { TagProps } from 'antd'

export const AtTag = forwardRef<React.ElementRef<typeof AntTag>, TagProps>((props, ref) => {
  return <AntTag {...props} ref={ref} />
})

export default AtTag