import type { Meta, StoryObj } from '@storybook/react'
import { AtDatePicker } from './index'

const meta: Meta<typeof AtDatePicker> = {
  title: 'At/AtDatePicker',
  component: AtDatePicker,
  args: {
    placeholder: '选择日期',
  },
}

export default meta
export const Basic: StoryObj<typeof AtDatePicker> = {}