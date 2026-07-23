import type { Meta, StoryObj } from '@storybook/react'
import { CwCascader } from './CwCascader'

const meta: Meta<typeof CwCascader> = {
  title: 'Cw/CwCascader',
  component: CwCascader,
}

export default meta
type Story = StoryObj<typeof CwCascader>

export const Default: Story = {
  args: {
    children: 'CwCascader',
  },
}
