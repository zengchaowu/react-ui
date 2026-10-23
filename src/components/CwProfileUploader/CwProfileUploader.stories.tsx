import type { Meta, StoryObj } from '@storybook/react'
import { CwProfileUploader } from './CwProfileUploader'

const meta: Meta<typeof CwProfileUploader> = {
  title: '1. Components/Form/CwProfileUploader',
  component: CwProfileUploader,
}

export default meta
type Story = StoryObj<typeof CwProfileUploader>

export const Default: Story = {
  args: {},
}
