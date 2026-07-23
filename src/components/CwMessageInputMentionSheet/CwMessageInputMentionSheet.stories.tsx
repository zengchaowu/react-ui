import type { Meta, StoryObj } from '@storybook/react'
import { CwMessageInputMentionSheet } from './CwMessageInputMentionSheet'

const meta: Meta<typeof CwMessageInputMentionSheet> = {
  title: 'Cw/CwMessageInputMentionSheet',
  component: CwMessageInputMentionSheet,
}

export default meta
type Story = StoryObj<typeof CwMessageInputMentionSheet>

export const Default: Story = {
  args: {
    children: 'CwMessageInputMentionSheet',
  },
}
