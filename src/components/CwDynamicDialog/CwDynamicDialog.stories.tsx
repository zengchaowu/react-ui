import type { Meta, StoryObj } from '@storybook/react'
import CwDynamicDialog from './CwDynamicDialog'

const meta: Meta<typeof CwDynamicDialog> = {
  title: '1. Components/Overlay/CwDynamicDialog',
  component: CwDynamicDialog,
}

export default meta
type Story = StoryObj<typeof CwDynamicDialog>

export const Default: Story = {
  args: {},
}
