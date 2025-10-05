import React from 'react'
import { Tree } from 'antd'
import type { TreeProps } from 'antd/es/tree'

const AtTree: React.FC<TreeProps> = (props) => {
  return <Tree {...props} />
}

export default AtTree