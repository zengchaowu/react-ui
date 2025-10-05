import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtQRCode } from '.'
import type { QRCodeProps } from './types'

const meta: Meta<QRCodeProps> = {
  title: 'At/AtQRCode',
  component: AtQRCode,
}
export default meta

type Story = StoryObj<QRCodeProps>

export const Basic: Story = {
  args: {
    value: 'https://ant.design',
  },
}