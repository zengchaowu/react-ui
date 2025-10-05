import React from 'react'
import { Rate } from 'antd'
import type { RateProps } from 'antd'

const AtRate: React.FC<RateProps> = (props) => {
  return <Rate {...props} />
}

export default AtRate