import type { Meta, StoryObj } from '@storybook/react'
import { CwMessageInput } from './CwMessageInput'

const meta: Meta<typeof CwMessageInput> = {
  title: '1. Components/Chat/CwMessageInput',
  component: CwMessageInput,
}

export default meta
type Story = StoryObj<typeof CwMessageInput>

export const Default: Story = {
  args: {
    placeholder: '发消息…',
    mentionAvatarFallbackSrc: '',
  },
}

export const WithMentions: Story = {
  args: {
    placeholder: '输入 @ 提及成员',
    mentionAvatarFallbackSrc: '',
    mentionItems: [
      { id: 'u1', label: '张三' },
      { id: 'u2', label: '李四' },
    ],
  },
}
