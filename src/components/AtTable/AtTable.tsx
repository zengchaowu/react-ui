import React, { forwardRef } from 'react'
import { Table as AntTable } from 'antd'
import type { TableProps } from 'antd'

export const AtTable = forwardRef<React.ElementRef<typeof AntTable>, TableProps<any>>((props, ref) => {
  return <AntTable {...props} ref={ref} />
})

export default AtTable