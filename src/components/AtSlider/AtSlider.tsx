import React from 'react'
import { Slider } from 'antd'
import type { SliderSingleProps, SliderRangeProps } from 'antd/es/slider'

export type AtSliderProps = SliderSingleProps | SliderRangeProps

const AtSlider: React.FC<AtSliderProps> = (props) => {
  return <Slider {...props} />
}

export default AtSlider