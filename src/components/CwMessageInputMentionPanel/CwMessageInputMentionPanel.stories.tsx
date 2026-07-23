import type { Meta, StoryObj } from '@storybook/react'
import { CwMessageInputMentionPanel } from './CwMessageInputMentionPanel'

const meta: Meta<typeof CwMessageInputMentionPanel> = {
  title: 'Cw/CwMessageInputMentionPanel',
  component: CwMessageInputMentionPanel,
}

export default meta
type Story = StoryObj<typeof CwMessageInputMentionPanel>

export const Default: Story = {
  args: {
    children: 'CwMessageInputMentionPanel',
  },
}
