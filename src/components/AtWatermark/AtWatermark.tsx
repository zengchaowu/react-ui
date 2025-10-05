import React from 'react'
import { Watermark } from 'antd'
import type { WatermarkProps } from 'antd/es/watermark'

const AtWatermark: React.FC<WatermarkProps> = (props) => {
  return <Watermark {...props}>{props.children}</Watermark>
}

export default AtWatermark