import type { Meta, StoryObj } from '@storybook/react'
import { CwSwitch } from './CwSwitch'

const meta: Meta<typeof CwSwitch> = {
  title: '1. Components/Form/CwSwitch',
  component: CwSwitch,
}

export default meta
type Story = StoryObj<typeof CwSwitch>

export const Default: Story = {
  args: {
    value: true,
  },
}
