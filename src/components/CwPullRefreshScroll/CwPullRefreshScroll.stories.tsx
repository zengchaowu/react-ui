import type { Meta, StoryObj } from '@storybook/react'
import { CwPullRefreshScroll } from './CwPullRefreshScroll'

const meta: Meta<typeof CwPullRefreshScroll> = {
  title: 'Cw/CwPullRefreshScroll',
  component: CwPullRefreshScroll,
}

export default meta
type Story = StoryObj<typeof CwPullRefreshScroll>

export const Default: Story = {
  args: {
    children: 'CwPullRefreshScroll',
  },
}
