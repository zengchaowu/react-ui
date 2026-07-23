import type { Meta, StoryObj } from '@storybook/react'
import { CwInput } from './CwInput'

const meta: Meta<typeof CwInput> = {
  title: 'Cw/CwInput',
  component: CwInput,
}

export default meta
type Story = StoryObj<typeof CwInput>

export const Default: Story = {
  args: {
    children: 'CwInput',
  },
}
