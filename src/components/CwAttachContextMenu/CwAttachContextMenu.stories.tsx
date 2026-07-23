import type { Meta, StoryObj } from '@storybook/react'
import { CwAttachContextMenu } from './CwAttachContextMenu'

const meta: Meta<typeof CwAttachContextMenu> = {
  title: 'Cw/CwAttachContextMenu',
  component: CwAttachContextMenu,
}

export default meta
type Story = StoryObj<typeof CwAttachContextMenu>

export const Default: Story = {
  args: {
    children: 'CwAttachContextMenu',
  },
}
