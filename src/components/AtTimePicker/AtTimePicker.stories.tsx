import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtTimePicker } from '.'
import type { TimePickerProps } from './types'

const meta: Meta<TimePickerProps> = {
  title: 'At/AtTimePicker',
  component: AtTimePicker,
}
export default meta

type Story = StoryObj<TimePickerProps>

export const Basic: Story = {
  args: {
    use12Hours: true,
    format: 'h:mm a',
  },
}