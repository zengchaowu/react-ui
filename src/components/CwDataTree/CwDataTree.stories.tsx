import type { Meta, StoryObj } from '@storybook/react'
import { CwDataTree } from './CwDataTree'

const meta: Meta<typeof CwDataTree> = {
  title: 'Cw/CwDataTree',
  component: CwDataTree,
}

export default meta
type Story = StoryObj<typeof CwDataTree>

export const Default: Story = {
  args: {
    children: 'CwDataTree',
  },
}
