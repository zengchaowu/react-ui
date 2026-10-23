import type { Meta, StoryObj } from '@storybook/react'
import { CwImageCropperSheet } from './CwImageCropperSheet'

const meta: Meta<typeof CwImageCropperSheet> = {
  title: '1. Components/Overlay/CwImageCropperSheet',
  component: CwImageCropperSheet,
}

export default meta
type Story = StoryObj<typeof CwImageCropperSheet>

export const Default: Story = {
  args: {},
}
