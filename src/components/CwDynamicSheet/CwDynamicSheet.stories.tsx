import type { Meta, StoryObj } from '@storybook/react'
import { CwDynamicSheet } from './CwDynamicSheet'

const meta: Meta<typeof CwDynamicSheet> = {
  title: 'Cw/CwDynamicSheet',
  component: CwDynamicSheet,
}

export default meta
type Story = StoryObj<typeof CwDynamicSheet>

export const Default: Story = {
  args: {
    children: 'CwDynamicSheet',
  },
}
