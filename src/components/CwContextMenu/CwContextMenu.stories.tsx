import type { Meta, StoryObj } from '@storybook/react'
import { CwContextMenu } from './CwContextMenu'

const meta: Meta<typeof CwContextMenu> = {
  title: 'Cw/CwContextMenu',
  component: CwContextMenu,
}

export default meta
type Story = StoryObj<typeof CwContextMenu>

export const Default: Story = {
  args: {
    children: 'CwContextMenu',
  },
}
