import type { Meta, StoryObj } from '@storybook/react'
import { CwSecondaryTabs } from './CwSecondaryTabs'

const meta: Meta<typeof CwSecondaryTabs> = {
  title: 'Cw/CwSecondaryTabs',
  component: CwSecondaryTabs,
}

export default meta
type Story = StoryObj<typeof CwSecondaryTabs>

export const Default: Story = {
  args: {
    children: 'CwSecondaryTabs',
  },
}
