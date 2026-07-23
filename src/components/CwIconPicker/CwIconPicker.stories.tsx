import type { Meta, StoryObj } from '@storybook/react'
import { CwIconPicker } from './CwIconPicker'

const meta: Meta<typeof CwIconPicker> = {
  title: 'Cw/CwIconPicker',
  component: CwIconPicker,
}

export default meta
type Story = StoryObj<typeof CwIconPicker>

export const Default: Story = {
  args: {
    children: 'CwIconPicker',
  },
}
