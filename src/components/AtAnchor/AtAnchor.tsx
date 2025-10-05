import React from 'react'
import { Anchor } from 'antd'
import type { AnchorProps } from 'antd'

const AtAnchor: React.FC<AnchorProps> = (props) => {
  return <Anchor {...props} />
}

export default AtAnchor