import type { Meta, StoryObj } from '@storybook/react'
import { CwImageCropper } from './CwImageCropper'

const meta: Meta<typeof CwImageCropper> = {
  title: 'Cw/CwImageCropper',
  component: CwImageCropper,
}

export default meta
type Story = StoryObj<typeof CwImageCropper>

export const Default: Story = {
  args: {
    children: 'CwImageCropper',
  },
}
