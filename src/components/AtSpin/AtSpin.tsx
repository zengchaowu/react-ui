import React from 'react'
import { Spin } from 'antd'
import type { SpinProps } from 'antd'

const AtSpin: React.FC<SpinProps> = (props) => {
  return <Spin {...props} />
}

export default AtSpin