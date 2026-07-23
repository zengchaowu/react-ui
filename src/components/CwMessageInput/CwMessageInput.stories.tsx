import type { Meta, StoryObj } from '@storybook/react'
import { CwMessageInput } from './CwMessageInput'

const meta: Meta<typeof CwMessageInput> = {
  title: 'Cw/CwMessageInput',
  component: CwMessageInput,
}

export default meta
type Story = StoryObj<typeof CwMessageInput>

export const Default: Story = {
  args: {
    children: 'CwMessageInput',
  },
}
