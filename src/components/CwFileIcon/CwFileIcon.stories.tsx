import type { Meta, StoryObj } from '@storybook/react'
import { CwFileIcon } from './CwFileIcon'

const meta: Meta<typeof CwFileIcon> = {
  title: '1. Components/Media/CwFileIcon',
  component: CwFileIcon,
}

export default meta
type Story = StoryObj<typeof CwFileIcon>

export const Default: Story = {
  args: {
    path: 'example.ts',
  },
}
