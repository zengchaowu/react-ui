import React from 'react'
import { Mentions } from 'antd'
import type { MentionsProps } from 'antd/es/mentions'

const AtMentions: React.FC<MentionsProps> = (props) => {
  return <Mentions {...props} />
}

export default AtMentions