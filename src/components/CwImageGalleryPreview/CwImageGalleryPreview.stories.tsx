import type { Meta, StoryObj } from '@storybook/react'
import { CwImageGalleryPreview } from './CwImageGalleryPreview'

const meta: Meta<typeof CwImageGalleryPreview> = {
  title: 'Cw/CwImageGalleryPreview',
  component: CwImageGalleryPreview,
}

export default meta
type Story = StoryObj<typeof CwImageGalleryPreview>

export const Default: Story = {
  args: {
    children: 'CwImageGalleryPreview',
  },
}
