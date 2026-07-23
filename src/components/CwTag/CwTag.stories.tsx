import type { Meta, StoryObj } from '@storybook/react'
import { CwTag } from './CwTag'

const meta: Meta<typeof CwTag> = {
  title: 'Cw/CwTag',
  component: CwTag,
}

export default meta
type Story = StoryObj<typeof CwTag>

export const Default: Story = {
  args: {
    children: 'CwTag',
  },
}
