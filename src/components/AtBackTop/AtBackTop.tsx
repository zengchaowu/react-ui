import React from 'react'
import { BackTop } from 'antd'
import type { BackTopProps } from 'antd/es/back-top'

const AtBackTop: React.FC<BackTopProps> = (props) => {
  return <BackTop {...props} />
}

export default AtBackTop