import type { Meta, StoryObj } from '@storybook/react'
import { CwDatePicker } from './CwDatePicker'

const meta: Meta<typeof CwDatePicker> = {
  title: 'Cw/CwDatePicker',
  component: CwDatePicker,
}

export default meta
type Story = StoryObj<typeof CwDatePicker>

export const Default: Story = {
  args: {
    children: 'CwDatePicker',
  },
}
