import type { Meta, StoryObj } from '@storybook/react'
import { CwWindowTitleBar } from './CwWindowTitleBar'

const meta: Meta<typeof CwWindowTitleBar> = {
  title: 'Cw/CwWindowTitleBar',
  component: CwWindowTitleBar,
}

export default meta
type Story = StoryObj<typeof CwWindowTitleBar>

export const Default: Story = {
  args: {
    children: 'CwWindowTitleBar',
  },
}
