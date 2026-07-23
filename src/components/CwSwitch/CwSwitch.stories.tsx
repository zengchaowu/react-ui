import type { Meta, StoryObj } from '@storybook/react'
import { CwSwitch } from './CwSwitch'

const meta: Meta<typeof CwSwitch> = {
  title: 'Cw/CwSwitch',
  component: CwSwitch,
}

export default meta
type Story = StoryObj<typeof CwSwitch>

export const Default: Story = {
  args: {
    children: 'CwSwitch',
  },
}
