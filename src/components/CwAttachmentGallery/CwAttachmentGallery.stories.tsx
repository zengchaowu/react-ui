import type { Meta, StoryObj } from '@storybook/react'
import { CwAttachmentGallery } from './CwAttachmentGallery'

const meta: Meta<typeof CwAttachmentGallery> = {
  title: 'Cw/CwAttachmentGallery',
  component: CwAttachmentGallery,
}

export default meta
type Story = StoryObj<typeof CwAttachmentGallery>

export const Default: Story = {
  args: {
    children: 'CwAttachmentGallery',
  },
}
