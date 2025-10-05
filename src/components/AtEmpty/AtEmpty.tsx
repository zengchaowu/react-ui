import React from 'react'
import { Empty as AntEmpty } from 'antd'
import type { EmptyProps } from 'antd'

export const AtEmpty = (props: EmptyProps) => {
  return <AntEmpty {...props} />
}

export default AtEmpty