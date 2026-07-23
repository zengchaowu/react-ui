import type { Meta, StoryObj } from '@storybook/react'
import { CwConfirmDialog } from './CwConfirmDialog'

const meta: Meta<typeof CwConfirmDialog> = {
  title: 'Cw/CwConfirmDialog',
  component: CwConfirmDialog,
}

export default meta
type Story = StoryObj<typeof CwConfirmDialog>

export const Default: Story = {
  args: {
    children: 'CwConfirmDialog',
  },
}
