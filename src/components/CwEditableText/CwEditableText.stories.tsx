import type { Meta, StoryObj } from '@storybook/react'
import { CwEditableText } from './CwEditableText'

const meta: Meta<typeof CwEditableText> = {
  title: 'Cw/CwEditableText',
  component: CwEditableText,
}

export default meta
type Story = StoryObj<typeof CwEditableText>

export const Default: Story = {
  args: {
    children: 'CwEditableText',
  },
}
