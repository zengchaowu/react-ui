import type { Meta, StoryObj } from '@storybook/react'
import { CwStackPop } from './CwStackPop'

const meta: Meta<typeof CwStackPop> = {
  title: 'Cw/CwStackPop',
  component: CwStackPop,
}

export default meta
type Story = StoryObj<typeof CwStackPop>

export const Default: Story = {
  args: {
    children: 'CwStackPop',
  },
}
