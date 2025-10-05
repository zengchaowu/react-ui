import React from 'react'
import { Result } from 'antd'
import type { ResultProps } from 'antd'

const AtResult: React.FC<ResultProps> = (props) => {
  return <Result {...props} />
}

export default AtResult