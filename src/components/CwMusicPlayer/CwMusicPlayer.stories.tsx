import type { Meta, StoryObj } from '@storybook/react'
import { CwMusicPlayer } from './CwMusicPlayer'

const meta: Meta<typeof CwMusicPlayer> = {
  title: 'Cw/CwMusicPlayer',
  component: CwMusicPlayer,
}

export default meta
type Story = StoryObj<typeof CwMusicPlayer>

export const Default: Story = {
  args: {
    children: 'CwMusicPlayer',
  },
}
