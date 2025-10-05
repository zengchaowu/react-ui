import React from 'react'
import { Modal as AntModal } from 'antd'
import type { ModalProps } from 'antd'

export const AtModal: React.FC<ModalProps> = (props) => {
  return <AntModal {...props} />
}

export default AtModal