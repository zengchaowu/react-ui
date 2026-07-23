import type { Meta, StoryObj } from '@storybook/react'
import { CwStickyTabs } from './CwStickyTabs'

const meta: Meta<typeof CwStickyTabs> = {
  title: 'Cw/CwStickyTabs',
  component: CwStickyTabs,
}

export default meta
type Story = StoryObj<typeof CwStickyTabs>

export const Default: Story = {
  args: {
    children: 'CwStickyTabs',
  },
}
