import type { Meta, StoryObj } from '@storybook/react'
import { CwButtonGroup } from './CwButtonGroup'

const meta: Meta<typeof CwButtonGroup> = {
  title: 'Cw/CwButtonGroup',
  component: CwButtonGroup,
}

export default meta
type Story = StoryObj<typeof CwButtonGroup>

export const Default: Story = {
  args: {
    children: 'CwButtonGroup',
  },
}
