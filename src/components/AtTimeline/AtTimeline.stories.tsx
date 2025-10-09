import type { Meta, StoryObj } from '@storybook/react'
import { AtTimeline } from './index'

const meta: Meta<typeof AtTimeline> = {
  title: 'At/AtTimeline',
  component: AtTimeline,
  args: {
    items: [
      { children: 'Create a services site 2015-09-01' },
      { children: 'Solve initial network problems 2015-09-01' },
      { children: 'Technical testing 2015-09-01' },
      { children: 'Network problems being solved 2015-09-01' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtTimeline> = {}