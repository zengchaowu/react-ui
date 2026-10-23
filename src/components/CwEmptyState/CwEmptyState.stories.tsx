import type { Meta, StoryObj } from '@storybook/react'
import { CwEmptyState } from './CwEmptyState'

const meta: Meta<typeof CwEmptyState> = {
  title: '1. Components/Display/CwEmptyState',
  component: CwEmptyState,
}

export default meta
type Story = StoryObj<typeof CwEmptyState>

export const Default: Story = {}
