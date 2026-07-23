import type { Meta, StoryObj } from '@storybook/react'
import { CwTikTokFeed } from './CwTikTokFeed'

const meta: Meta<typeof CwTikTokFeed> = {
  title: 'Cw/CwTikTokFeed',
  component: CwTikTokFeed,
}

export default meta
type Story = StoryObj<typeof CwTikTokFeed>

export const Default: Story = {
  args: {
    children: 'CwTikTokFeed',
  },
}
