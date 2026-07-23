import type { Meta, StoryObj } from '@storybook/react'
import { CwPhoneLoginDialog } from './CwPhoneLoginDialog'

const meta: Meta<typeof CwPhoneLoginDialog> = {
  title: 'Cw/CwPhoneLoginDialog',
  component: CwPhoneLoginDialog,
}

export default meta
type Story = StoryObj<typeof CwPhoneLoginDialog>

export const Default: Story = {
  args: {
    children: 'CwPhoneLoginDialog',
  },
}
