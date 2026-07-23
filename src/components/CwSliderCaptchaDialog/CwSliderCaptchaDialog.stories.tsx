import type { Meta, StoryObj } from '@storybook/react'
import { CwSliderCaptchaDialog } from './CwSliderCaptchaDialog'

const meta: Meta<typeof CwSliderCaptchaDialog> = {
  title: 'Cw/CwSliderCaptchaDialog',
  component: CwSliderCaptchaDialog,
}

export default meta
type Story = StoryObj<typeof CwSliderCaptchaDialog>

export const Default: Story = {
  args: {
    children: 'CwSliderCaptchaDialog',
  },
}
