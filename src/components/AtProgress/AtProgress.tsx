import React from 'react'
import { Progress as AntProgress } from 'antd'
import type { ProgressProps } from 'antd'

export const AtProgress = (props: ProgressProps) => {
  return <AntProgress {...props} />
}

export default AtProgress