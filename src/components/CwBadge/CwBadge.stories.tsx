import type { Meta, StoryObj } from '@storybook/react'
import { CwBadge } from './CwBadge'

const meta: Meta<typeof CwBadge> = {
  title: 'Cw/CwBadge',
  component: CwBadge,
}

export default meta
type Story = StoryObj<typeof CwBadge>

export const Default: Story = {
  args: {
    children: 'CwBadge',
  },
}
