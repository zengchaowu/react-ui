import type { Meta, StoryObj } from '@storybook/react'
import { CwChatWorkedBlock } from './CwChatWorkedBlock'

const meta: Meta<typeof CwChatWorkedBlock> = {
  title: '1. Components/Chat/CwChatWorkedBlock',
  component: CwChatWorkedBlock,
}

export default meta
type Story = StoryObj<typeof CwChatWorkedBlock>

export const Default: Story = {
  args: {},
}
