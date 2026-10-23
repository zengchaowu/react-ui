import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginPhoneDialog } from './CwLoginPhoneDialog'

const meta: Meta<typeof CwLoginPhoneDialog> = {
  title: '1. Components/Overlay/CwLoginPhoneDialog',
  component: CwLoginPhoneDialog,
}

export default meta
type Story = StoryObj<typeof CwLoginPhoneDialog>

export const Default: Story = {
  args: {},
}
