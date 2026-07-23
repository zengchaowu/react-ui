import type { Meta, StoryObj } from '@storybook/react'
import { CwCell } from './CwCell'

const meta: Meta<typeof CwCell> = {
  title: 'Cw/CwCell',
  component: CwCell,
}

export default meta
type Story = StoryObj<typeof CwCell>

export const Default: Story = {
  args: {
    children: 'CwCell',
  },
}
