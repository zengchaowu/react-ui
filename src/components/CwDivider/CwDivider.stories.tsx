import type { Meta, StoryObj } from '@storybook/react'
import { CwDivider } from './CwDivider'

const meta: Meta<typeof CwDivider> = {
  title: 'Cw/CwDivider',
  component: CwDivider,
}

export default meta
type Story = StoryObj<typeof CwDivider>

export const Default: Story = {
  args: {
    children: 'CwDivider',
  },
}
