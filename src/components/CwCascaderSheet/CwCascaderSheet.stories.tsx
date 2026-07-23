import type { Meta, StoryObj } from '@storybook/react'
import { CwCascaderSheet } from './CwCascaderSheet'

const meta: Meta<typeof CwCascaderSheet> = {
  title: 'Cw/CwCascaderSheet',
  component: CwCascaderSheet,
}

export default meta
type Story = StoryObj<typeof CwCascaderSheet>

export const Default: Story = {
  args: {
    children: 'CwCascaderSheet',
  },
}
