import type { Meta, StoryObj } from '@storybook/react'
import { CwSkeleton } from './CwSkeleton'

const meta: Meta<typeof CwSkeleton> = {
  title: '1. Components/Display/CwSkeleton',
  component: CwSkeleton,
}

export default meta
type Story = StoryObj<typeof CwSkeleton>

export const Default: Story = {
  args: {},
}
