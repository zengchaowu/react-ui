import type { Meta, StoryObj } from '@storybook/react'
import { CwFlex } from './CwFlex'

const meta: Meta<typeof CwFlex> = {
  title: 'Cw/CwFlex',
  component: CwFlex,
}

export default meta
type Story = StoryObj<typeof CwFlex>

export const Default: Story = {
  args: {
    children: 'CwFlex',
  },
}
