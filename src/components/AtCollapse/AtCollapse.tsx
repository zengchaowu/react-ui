import React from 'react'
import { Collapse as AntCollapse } from 'antd'
import type { CollapseProps } from 'antd'

export const AtCollapse = (props: CollapseProps) => {
  return <AntCollapse {...props} />
}

export default AtCollapse