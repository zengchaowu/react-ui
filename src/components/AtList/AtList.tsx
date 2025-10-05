import React from 'react'
import { List } from 'antd'
import type { ListProps } from 'antd/es/list'

const AtList = <T extends any>(props: ListProps<T>) => {
  return <List {...props} />
}

export default AtList