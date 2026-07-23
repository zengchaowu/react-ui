import type { Meta, StoryObj } from '@storybook/react'
import { CwEditableEmail } from './CwEditableEmail'

const meta: Meta<typeof CwEditableEmail> = {
  title: 'Cw/CwEditableEmail',
  component: CwEditableEmail,
}

export default meta
type Story = StoryObj<typeof CwEditableEmail>

export const Default: Story = {
  args: {
    children: 'CwEditableEmail',
  },
}
