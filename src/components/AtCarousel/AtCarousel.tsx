import React from 'react'
import { Carousel } from 'antd'
import type { CarouselProps } from 'antd/es/carousel'

const AtCarousel: React.FC<CarouselProps> = (props) => {
  return <Carousel {...props}>{props.children}</Carousel>
}

export default AtCarousel