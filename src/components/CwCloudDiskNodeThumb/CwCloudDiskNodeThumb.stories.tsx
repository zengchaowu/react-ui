import type { Meta, StoryObj } from '@storybook/react'
import { CwCloudDiskNodeThumb } from './CwCloudDiskNodeThumb'

const meta: Meta<typeof CwCloudDiskNodeThumb> = {
  title: '1. Components/Media/CwCloudDiskNodeThumb',
  component: CwCloudDiskNodeThumb,
}

export default meta
type Story = StoryObj<typeof CwCloudDiskNodeThumb>

export const Default: Story = {
  args: {},
}
