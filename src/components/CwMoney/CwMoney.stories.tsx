import type { Meta, StoryObj } from '@storybook/react'
import { CwMoney } from './CwMoney'

const meta: Meta<typeof CwMoney> = {
  title: '1. Components/Display/CwMoney',
  component: CwMoney,
}

export default meta
type Story = StoryObj<typeof CwMoney>

export const Default: Story = {
  args: {
    value: 1234.56,
    currency: '¥',
    decimals: 2,
    size: 'default',
  },
}

export const Small: Story = {
  args: {
    value: 88,
    size: 'sm',
  },
}

export const TextMode: Story = {
  args: {
    text: '免费',
    currency: '',
  },
}
