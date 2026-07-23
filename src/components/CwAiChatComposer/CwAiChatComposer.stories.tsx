import type { Meta, StoryObj } from '@storybook/react'
import { CwAiChatComposer } from './CwAiChatComposer'

const meta: Meta<typeof CwAiChatComposer> = {
  title: 'Cw/CwAiChatComposer',
  component: CwAiChatComposer,
}

export default meta
type Story = StoryObj<typeof CwAiChatComposer>

export const Default: Story = {
  args: {
    children: 'CwAiChatComposer',
  },
}
