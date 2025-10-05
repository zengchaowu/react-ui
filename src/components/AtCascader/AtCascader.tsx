import React from 'react'
import { Cascader } from 'antd'
import type { CascaderProps } from 'antd'

const AtCascader: React.FC<CascaderProps<any>> = (props) => {
  return <Cascader {...props} />
}

export default AtCascader