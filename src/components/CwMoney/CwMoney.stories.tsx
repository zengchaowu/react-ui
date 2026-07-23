import type { Meta, StoryObj } from '@storybook/react'
import { CwMoney } from './CwMoney'

const meta: Meta<typeof CwMoney> = {
  title: 'Cw/CwMoney',
  component: CwMoney,
}

export default meta
type Story = StoryObj<typeof CwMoney>

export const Default: Story = {
  args: {
    children: 'CwMoney',
  },
}
