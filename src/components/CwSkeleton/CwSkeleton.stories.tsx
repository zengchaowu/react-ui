import type { Meta, StoryObj } from '@storybook/react'
import { CwSkeleton } from './CwSkeleton'

const meta: Meta<typeof CwSkeleton> = {
  title: 'Cw/CwSkeleton',
  component: CwSkeleton,
}

export default meta
type Story = StoryObj<typeof CwSkeleton>

export const Default: Story = {
  args: {
    children: 'CwSkeleton',
  },
}
