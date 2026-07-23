import type { Meta, StoryObj } from '@storybook/react'
import { CwShareSheet } from './CwShareSheet'

const meta: Meta<typeof CwShareSheet> = {
  title: 'Cw/CwShareSheet',
  component: CwShareSheet,
}

export default meta
type Story = StoryObj<typeof CwShareSheet>

export const Default: Story = {
  args: {
    children: 'CwShareSheet',
  },
}
