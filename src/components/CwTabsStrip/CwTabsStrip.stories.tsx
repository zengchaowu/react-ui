import type { Meta, StoryObj } from '@storybook/react'
import { CwTabsStrip } from './CwTabsStrip'

const meta: Meta<typeof CwTabsStrip> = {
  title: 'Cw/CwTabsStrip',
  component: CwTabsStrip,
}

export default meta
type Story = StoryObj<typeof CwTabsStrip>

export const Default: Story = {
  args: {
    children: 'CwTabsStrip',
  },
}
