import type { Meta, StoryObj } from '@storybook/react'
import { CwAttachmentPreview } from './CwAttachmentPreview'

const meta: Meta<typeof CwAttachmentPreview> = {
  title: 'Cw/CwAttachmentPreview',
  component: CwAttachmentPreview,
}

export default meta
type Story = StoryObj<typeof CwAttachmentPreview>

export const Default: Story = {
  args: {
    children: 'CwAttachmentPreview',
  },
}
