import type { Meta, StoryObj } from '@storybook/react'
import { CwPhoneLoginSheet } from './CwPhoneLoginSheet'

const meta: Meta<typeof CwPhoneLoginSheet> = {
  title: 'Cw/CwPhoneLoginSheet',
  component: CwPhoneLoginSheet,
}

export default meta
type Story = StoryObj<typeof CwPhoneLoginSheet>

export const Default: Story = {
  args: {
    children: 'CwPhoneLoginSheet',
  },
}
