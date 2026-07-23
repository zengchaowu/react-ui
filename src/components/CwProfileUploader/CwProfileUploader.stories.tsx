import type { Meta, StoryObj } from '@storybook/react'
import { CwProfileUploader } from './CwProfileUploader'

const meta: Meta<typeof CwProfileUploader> = {
  title: 'Cw/CwProfileUploader',
  component: CwProfileUploader,
}

export default meta
type Story = StoryObj<typeof CwProfileUploader>

export const Default: Story = {
  args: {
    children: 'CwProfileUploader',
  },
}
