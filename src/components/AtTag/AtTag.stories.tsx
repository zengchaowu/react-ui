import type { Meta, StoryObj } from '@storybook/react'
import { AtTag } from './index'

const meta: Meta<typeof AtTag> = {
  title: 'At/AtTag',
  component: AtTag,
  args: {
    color: 'blue',
    children: '标签',
  },
}

export default meta
export const Basic: StoryObj<typeof AtTag> = {}