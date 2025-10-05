import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtFloatButton } from '.'
import type { FloatButtonProps } from './types'

const meta: Meta<FloatButtonProps> = {
  title: 'At/AtFloatButton',
  component: AtFloatButton,
}
export default meta

type Story = StoryObj<FloatButtonProps>

export const Basic: Story = {
  args: {
    tooltip: 'Float Button',
  },
}