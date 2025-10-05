import React from 'react'
import { Drawer as AntDrawer } from 'antd'
import type { DrawerProps } from 'antd'

export const AtDrawer: React.FC<DrawerProps> = (props) => {
  return <AntDrawer {...props} />
}

export default AtDrawer