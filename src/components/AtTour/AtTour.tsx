import React from 'react'
import Tour from 'antd/es/tour'
import type { TourProps } from 'antd/es/tour/interface'

const AtTour: React.FC<TourProps> = (props) => {
  return <Tour {...props} />
}

export default AtTour