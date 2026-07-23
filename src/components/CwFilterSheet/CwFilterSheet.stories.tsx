import type { Meta, StoryObj } from '@storybook/react'
import { CwFilterSheet } from './CwFilterSheet'

const meta: Meta<typeof CwFilterSheet> = {
  title: 'Cw/CwFilterSheet',
  component: CwFilterSheet,
}

export default meta
type Story = StoryObj<typeof CwFilterSheet>

export const Default: Story = {
  args: {
    children: 'CwFilterSheet',
  },
}
