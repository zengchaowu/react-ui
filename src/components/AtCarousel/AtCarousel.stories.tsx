import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtCarousel } from '.'
import type { CarouselProps } from './types'

const meta: Meta<CarouselProps> = {
  title: 'At/AtCarousel',
  component: AtCarousel,
}
export default meta

type Story = StoryObj<CarouselProps>

export const Basic: Story = {
  args: {
    autoplay: false,
    children: [
      <div key="1" style={{ background: '#364d79', color: '#fff', padding: 40, textAlign: 'center' }}>Slide 1</div>,
      <div key="2" style={{ background: '#64d179', color: '#fff', padding: 40, textAlign: 'center' }}>Slide 2</div>,
      <div key="3" style={{ background: '#79364d', color: '#fff', padding: 40, textAlign: 'center' }}>Slide 3</div>,
    ],
  },
}