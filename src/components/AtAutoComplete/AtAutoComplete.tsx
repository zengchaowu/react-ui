import React from 'react'
import { AutoComplete } from 'antd'
import type { AutoCompleteProps } from 'antd/es/auto-complete'

const AtAutoComplete: React.FC<AutoCompleteProps> = (props) => {
  return <AutoComplete {...props} />
}

export default AtAutoComplete