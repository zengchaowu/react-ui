import type { Meta, StoryObj } from '@storybook/react'
import { CwRow } from './CwRow'

const meta: Meta<typeof CwRow> = {
  title: 'Cw/CwRow',
  component: CwRow,
}

export default meta
type Story = StoryObj<typeof CwRow>

export const Default: Story = {
  args: {
    children: 'CwRow',
  },
}
