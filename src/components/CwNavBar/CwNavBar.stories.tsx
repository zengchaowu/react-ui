import type { Meta, StoryObj } from '@storybook/react'
import { CwNavBar } from './CwNavBar'

const meta: Meta<typeof CwNavBar> = {
  title: 'Cw/CwNavBar',
  component: CwNavBar,
}

export default meta
type Story = StoryObj<typeof CwNavBar>

export const Default: Story = {
  args: {
    children: 'CwNavBar',
  },
}
