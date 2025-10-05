import React from 'react'
import { QRCode } from 'antd'
import type { QRCodeProps } from 'antd/es/qr-code/interface'

const AtQRCode: React.FC<QRCodeProps> = (props) => {
  return <QRCode {...props} />
}

export default AtQRCode