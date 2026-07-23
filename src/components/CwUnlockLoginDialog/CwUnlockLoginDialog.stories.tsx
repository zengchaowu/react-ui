import type { Meta, StoryObj } from '@storybook/react'
import { CwUnlockLoginDialog } from './CwUnlockLoginDialog'

const meta: Meta<typeof CwUnlockLoginDialog> = {
  title: 'Cw/CwUnlockLoginDialog',
  component: CwUnlockLoginDialog,
}

export default meta
type Story = StoryObj<typeof CwUnlockLoginDialog>

export const Default: Story = {
  args: {
    children: 'CwUnlockLoginDialog',
  },
}
