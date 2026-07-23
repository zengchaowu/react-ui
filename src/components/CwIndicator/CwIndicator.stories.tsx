import type { Meta, StoryObj } from '@storybook/react'
import { CwIndicator } from './CwIndicator'

const meta: Meta<typeof CwIndicator> = {
  title: 'Cw/CwIndicator',
  component: CwIndicator,
}

export default meta
type Story = StoryObj<typeof CwIndicator>

export const Default: Story = {
  args: {
    children: 'CwIndicator',
  },
}
