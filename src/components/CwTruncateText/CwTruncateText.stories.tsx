import type { Meta, StoryObj } from '@storybook/react'
import { CwTruncateText } from './CwTruncateText'

const meta: Meta<typeof CwTruncateText> = {
  title: '1. Components/Display/CwTruncateText',
  component: CwTruncateText,
}

export default meta
type Story = StoryObj<typeof CwTruncateText>

export const Default: Story = {
  args: {
    text: 'CwTruncateText',
  },
}
