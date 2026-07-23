import type { Meta, StoryObj } from '@storybook/react'
import { CwChatShell } from './CwChatShell'

const meta: Meta<typeof CwChatShell> = {
  title: 'Cw/CwChatShell',
  component: CwChatShell,
}

export default meta
type Story = StoryObj<typeof CwChatShell>

export const Default: Story = {
  args: {
    children: 'CwChatShell',
  },
}
