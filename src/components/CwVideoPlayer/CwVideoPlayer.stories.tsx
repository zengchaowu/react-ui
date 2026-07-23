import type { Meta, StoryObj } from '@storybook/react'
import { CwVideoPlayer } from './CwVideoPlayer'

const meta: Meta<typeof CwVideoPlayer> = {
  title: 'Cw/CwVideoPlayer',
  component: CwVideoPlayer,
}

export default meta
type Story = StoryObj<typeof CwVideoPlayer>

export const Default: Story = {
  args: {
    children: 'CwVideoPlayer',
  },
}
