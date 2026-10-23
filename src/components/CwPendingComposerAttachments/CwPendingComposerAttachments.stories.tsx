import type { Meta, StoryObj } from '@storybook/react'
import { CwPendingComposerAttachments } from './CwPendingComposerAttachments'

const meta: Meta<typeof CwPendingComposerAttachments> = {
  title: '1. Components/Chat/CwPendingComposerAttachments',
  component: CwPendingComposerAttachments,
}

export default meta
type Story = StoryObj<typeof CwPendingComposerAttachments>

export const Default: Story = {
  args: {},
}
