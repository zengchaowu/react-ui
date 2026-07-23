import type { Meta, StoryObj } from '@storybook/react'
import { CwChatAgentToolStep } from './CwChatAgentToolStep'

const meta: Meta<typeof CwChatAgentToolStep> = {
  title: 'Cw/CwChatAgentToolStep',
  component: CwChatAgentToolStep,
}

export default meta
type Story = StoryObj<typeof CwChatAgentToolStep>

export const Default: Story = {
  args: {
    children: 'CwChatAgentToolStep',
  },
}
