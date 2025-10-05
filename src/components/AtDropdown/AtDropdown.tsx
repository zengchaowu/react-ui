import React from 'react'
import { Dropdown } from 'antd'
import type { DropdownProps } from 'antd'

const AtDropdown: React.FC<DropdownProps> = (props) => {
  return <Dropdown {...props} />
}

export default AtDropdown