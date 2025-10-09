import type { Meta, StoryObj } from '@storybook/react'
import { AtCard } from './index'

const meta: Meta<typeof AtCard> = {
  title: 'At/AtCard',
  component: AtCard,
  args: {
    title: 'At/AtCard',
    children: '这里是卡片内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtCard> = {}