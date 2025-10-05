import React, { forwardRef } from 'react'
import { Pagination as AntPagination } from 'antd'
import type { PaginationProps } from 'antd'

export const AtPagination = forwardRef<React.ElementRef<typeof AntPagination>, PaginationProps>((props, ref) => {
  return <AntPagination {...props} ref={ref} />
})

export default AtPagination