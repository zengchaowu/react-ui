import type { Meta, StoryObj } from '@storybook/react'
import { CwImagePreview } from './CwImagePreview'

const meta: Meta<typeof CwImagePreview> = {
  title: 'Cw/CwImagePreview',
  component: CwImagePreview,
}

export default meta
type Story = StoryObj<typeof CwImagePreview>

export const Default: Story = {
  args: {
    children: 'CwImagePreview',
  },
}
