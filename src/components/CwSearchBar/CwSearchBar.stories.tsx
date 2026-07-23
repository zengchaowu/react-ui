import type { Meta, StoryObj } from '@storybook/react'
import { CwSearchBar } from './CwSearchBar'

const meta: Meta<typeof CwSearchBar> = {
  title: 'Cw/CwSearchBar',
  component: CwSearchBar,
}

export default meta
type Story = StoryObj<typeof CwSearchBar>

export const Default: Story = {
  args: {
    children: 'CwSearchBar',
  },
}
