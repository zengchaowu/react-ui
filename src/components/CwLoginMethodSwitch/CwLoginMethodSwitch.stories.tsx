import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginMethodSwitch } from './CwLoginMethodSwitch'

const meta: Meta<typeof CwLoginMethodSwitch> = {
  title: 'Cw/CwLoginMethodSwitch',
  component: CwLoginMethodSwitch,
}

export default meta
type Story = StoryObj<typeof CwLoginMethodSwitch>

export const Default: Story = {
  args: {
    children: 'CwLoginMethodSwitch',
  },
}
