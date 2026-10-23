import type { Meta, StoryObj } from '@storybook/react'
import { CwLoginPhoneSheet } from './CwLoginPhoneSheet'

const meta: Meta<typeof CwLoginPhoneSheet> = {
  title: '1. Components/Overlay/CwLoginPhoneSheet',
  component: CwLoginPhoneSheet,
}

export default meta
type Story = StoryObj<typeof CwLoginPhoneSheet>

export const Default: Story = {
  args: {},
}
