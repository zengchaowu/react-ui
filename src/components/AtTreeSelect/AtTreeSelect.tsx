import React from 'react'
import { TreeSelect } from 'antd'
import type { TreeSelectProps } from 'antd/es/tree-select'

const AtTreeSelect: React.FC<TreeSelectProps> = (props) => {
  return <TreeSelect {...props} />
}

export default AtTreeSelect