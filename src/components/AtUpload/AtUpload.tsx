import React, { forwardRef } from 'react'
import { Upload as AntUpload } from 'antd'
import type { UploadProps } from 'antd'

export const AtUpload = forwardRef<React.ElementRef<typeof AntUpload>, UploadProps>((props, ref) => {
  return <AntUpload {...props} ref={ref} />
})

export default AtUpload