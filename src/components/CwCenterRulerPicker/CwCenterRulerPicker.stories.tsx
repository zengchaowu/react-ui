import type { Meta, StoryObj } from '@storybook/react'
import { CwCenterRulerPicker } from './CwCenterRulerPicker'

const meta: Meta<typeof CwCenterRulerPicker> = {
  title: 'Cw/CwCenterRulerPicker',
  component: CwCenterRulerPicker,
}

export default meta
type Story = StoryObj<typeof CwCenterRulerPicker>

export const Default: Story = {
  args: {
    children: 'CwCenterRulerPicker',
  },
}
