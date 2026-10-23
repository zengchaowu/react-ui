import type { Meta, StoryObj } from '@storybook/react'
import { CwFloatingWindowShell } from './CwFloatingWindowShell'

const meta: Meta<typeof CwFloatingWindowShell> = {
  title: '1. Components/Layout/CwFloatingWindowShell',
  component: CwFloatingWindowShell,
}

export default meta
type Story = StoryObj<typeof CwFloatingWindowShell>

export const Default: Story = {
  args: {
    maximized: false,
    minimized: false,
    noTransition: false,
    gestureActive: false,
  },
}

export const Maximized: Story = {
  args: {
    maximized: true,
  },
}
