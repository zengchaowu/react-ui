import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginMethodSwitch } from './CwLoginMethodSwitch'

const meta: Meta<typeof CwLoginMethodSwitch> = {
  title: '1. Components/Form/CwLoginMethodSwitch',
  component: CwLoginMethodSwitch,
}

export default meta
type Story = StoryObj<typeof CwLoginMethodSwitch>

export const Default: Story = {
  args: {},
}
