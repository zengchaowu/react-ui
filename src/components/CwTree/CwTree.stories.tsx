import type { Meta, StoryObj } from '@storybook/react'
import { CwTree } from './CwTree'

const meta: Meta<typeof CwTree> = {
  title: 'Cw/CwTree',
  component: CwTree,
}

export default meta
type Story = StoryObj<typeof CwTree>

export const Default: Story = {
  args: {
    children: 'CwTree',
  },
}
