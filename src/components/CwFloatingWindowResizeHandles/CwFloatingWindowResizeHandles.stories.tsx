import type { Meta, StoryObj } from '@storybook/react'
import { CwFloatingWindowResizeHandles } from './CwFloatingWindowResizeHandles'

const meta: Meta<typeof CwFloatingWindowResizeHandles> = {
  title: '1. Components/Layout/CwFloatingWindowResizeHandles',
  component: CwFloatingWindowResizeHandles,
}

export default meta
type Story = StoryObj<typeof CwFloatingWindowResizeHandles>

export const Default: Story = {
  args: {},
}
