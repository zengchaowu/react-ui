import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectSheet } from './CwSelectSheet'

const meta: Meta<typeof CwSelectSheet> = {
  title: 'Cw/CwSelectSheet',
  component: CwSelectSheet,
}

export default meta
type Story = StoryObj<typeof CwSelectSheet>

export const Default: Story = {
  args: {
    children: 'CwSelectSheet',
  },
}
