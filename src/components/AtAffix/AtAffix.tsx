import React from 'react'
import { Affix } from 'antd'
import type { AffixProps } from 'antd/es/affix'

const AtAffix: React.FC<AffixProps> = (props) => {
  return <Affix {...props}>{props.children}</Affix>
}

export default AtAffix