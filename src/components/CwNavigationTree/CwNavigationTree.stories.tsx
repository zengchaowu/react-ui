import type { Meta, StoryObj } from '@storybook/react'
import { CwNavigationTree } from './CwNavigationTree'

const meta: Meta<typeof CwNavigationTree> = {
  title: 'Cw/CwNavigationTree',
  component: CwNavigationTree,
}

export default meta
type Story = StoryObj<typeof CwNavigationTree>

export const Default: Story = {
  args: {
    children: 'CwNavigationTree',
  },
}
