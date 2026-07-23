import type { Meta, StoryObj } from '@storybook/react'
import { CwImageGallery } from './CwImageGallery'

const meta: Meta<typeof CwImageGallery> = {
  title: 'Cw/CwImageGallery',
  component: CwImageGallery,
}

export default meta
type Story = StoryObj<typeof CwImageGallery>

export const Default: Story = {
  args: {
    children: 'CwImageGallery',
  },
}
