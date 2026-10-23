import type { Meta, StoryObj } from '@storybook/react'
import { CwChatActivityItems } from './CwChatActivityItems'

const meta: Meta<typeof CwChatActivityItems> = {
  title: '1. Components/Chat/CwChatActivityItems',
  component: CwChatActivityItems,
}

export default meta
type Story = StoryObj<typeof CwChatActivityItems>

export const Default: Story = {
  args: {},
}
