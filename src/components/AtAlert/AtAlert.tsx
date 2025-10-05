import React from 'react'
import { Alert as AntAlert } from 'antd'
import type { AlertProps } from 'antd'

export const AtAlert = (props: AlertProps) => {
  return <AntAlert {...props} />
}

export default AtAlert