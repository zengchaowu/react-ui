import type { Meta, StoryObj } from '@storybook/react'
import { CwLoading } from './CwLoading'

const meta: Meta<typeof CwLoading> = {
  title: 'Cw/CwLoading',
  component: CwLoading,
}

export default meta
type Story = StoryObj<typeof CwLoading>

export const Default: Story = {
  args: {
    children: 'CwLoading',
  },
}
