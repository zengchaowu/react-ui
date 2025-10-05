import React from 'react'
import { Transfer } from 'antd'
import type { TransferProps } from 'antd/es/transfer'

const AtTransfer = <T extends any>(props: TransferProps<T>) => {
  return <Transfer {...props} />
}

export default AtTransfer