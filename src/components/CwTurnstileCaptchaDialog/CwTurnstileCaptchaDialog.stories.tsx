import type { Meta, StoryObj } from '@storybook/react'
import { CwTurnstileCaptchaDialog } from './CwTurnstileCaptchaDialog'

const meta: Meta<typeof CwTurnstileCaptchaDialog> = {
  title: 'Cw/CwTurnstileCaptchaDialog',
  component: CwTurnstileCaptchaDialog,
}

export default meta
type Story = StoryObj<typeof CwTurnstileCaptchaDialog>

export const Default: Story = {
  args: {
    children: 'CwTurnstileCaptchaDialog',
  },
}
