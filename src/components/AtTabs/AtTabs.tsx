import React, { forwardRef } from 'react'
import { Tabs as AntTabs } from 'antd'
import type { TabsProps } from 'antd'

export const AtTabs = forwardRef<React.ElementRef<typeof AntTabs>, TabsProps>((props, ref) => {
  return <AntTabs {...props} ref={ref} />
})

export default AtTabs