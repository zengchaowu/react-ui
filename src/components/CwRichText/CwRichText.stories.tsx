import type { Meta, StoryObj } from '@storybook/react'
import { CwRichText } from './CwRichText'

const meta: Meta<typeof CwRichText> = {
  title: 'Cw/CwRichText',
  component: CwRichText,
}

export default meta
type Story = StoryObj<typeof CwRichText>

export const Default: Story = {
  args: {
    children: 'CwRichText',
  },
}
