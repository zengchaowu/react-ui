import type { Meta, StoryObj } from '@storybook/react'
import { CwRichText } from './CwRichText'

const meta: Meta<typeof CwRichText> = {
  title: '1. Components/Display/CwRichText',
  component: CwRichText,
}

export default meta
type Story = StoryObj<typeof CwRichText>

export const Default: Story = {
  args: {
    dsl: [
      { type: 'text', text: '这是一段普通文本，包含一个' },
      { type: 'link', href: 'https://example.com', text: '链接' },
      { type: 'text', text: '。' },
    ],
  },
}

export const WithFormatting: Story = {
  args: {
    dsl: [
      { type: 'text', text: '这是一段包含' },
      { type: 'bold', children: [{ type: 'text', text: '粗体' }] },
      { type: 'text', text: '、' },
      { type: 'italic', children: [{ type: 'text', text: '斜体' }] },
      { type: 'text', text: '和' },
      { type: 'underline', children: [{ type: 'text', text: '下划线' }] },
      { type: 'text', text: '的文本。' },
    ],
  },
}
