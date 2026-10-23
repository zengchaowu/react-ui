import type { Meta, StoryObj } from '@storybook/react'
import { CwChatThoughtBlock } from './CwChatThoughtBlock'

const meta: Meta<typeof CwChatThoughtBlock> = {
  title: '1. Components/Chat/CwChatThoughtBlock',
  component: CwChatThoughtBlock,
}

export default meta
type Story = StoryObj<typeof CwChatThoughtBlock>

export const Default: Story = {
  args: {},
}
