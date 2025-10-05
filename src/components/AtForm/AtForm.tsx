import React from 'react'
import { Form as AntForm } from 'antd'
import type { FormProps, FormItemProps } from 'antd'

export const AtForm = (props: FormProps) => {
  const { children, ...rest } = props
  return <AntForm {...rest}>{children as any}</AntForm>
}

export const AtFormItem = (props: FormItemProps) => {
  return <AntForm.Item {...props} />
}

export default AtForm