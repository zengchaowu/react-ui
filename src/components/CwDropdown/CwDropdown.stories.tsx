import type { Meta, StoryObj } from '@storybook/react'
import { CwDropdown } from './CwDropdown'

const meta: Meta<typeof CwDropdown> = {
  title: 'Cw/CwDropdown',
  component: CwDropdown,
}

export default meta
type Story = StoryObj<typeof CwDropdown>

export const Default: Story = {
  args: {
    children: 'CwDropdown',
  },
}
