import type { Meta, StoryObj } from '@storybook/react'
import { AtBadge } from './index'

const meta: Meta<typeof AtBadge> = {
  title: 'At/AtBadge',
  component: AtBadge,
  args: {
    count: 5,
    children: '内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtBadge> = {}