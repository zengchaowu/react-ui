import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtWatermark } from '.'
import type { WatermarkProps } from './types'

const meta: Meta<WatermarkProps> = {
  title: 'At/AtWatermark',
  component: AtWatermark,
}
export default meta

type Story = StoryObj<WatermarkProps>

export const Basic: Story = {
  args: {
    content: 'Ant Design',
    children: <div style={{ height: 200 }} />,
  },
}