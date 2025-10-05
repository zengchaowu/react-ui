import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AtCalendar } from '.'
import type { CalendarProps } from './types'

const meta: Meta<CalendarProps<any>> = {
  title: 'At/AtCalendar',
  component: AtCalendar,
}
export default meta

type Story = StoryObj<CalendarProps<any>>

export const Basic: Story = {
  args: {
    fullscreen: false,
  },
}