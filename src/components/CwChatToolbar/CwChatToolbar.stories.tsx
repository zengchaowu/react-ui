import type { Meta, StoryObj } from '@storybook/react'
import { CwChatToolbar } from './CwChatToolbar'

const meta: Meta<typeof CwChatToolbar> = {
  title: 'Cw/CwChatToolbar',
  component: CwChatToolbar,
}

export default meta
type Story = StoryObj<typeof CwChatToolbar>

export const Default: Story = {
  args: {
    children: 'CwChatToolbar',
  },
}
