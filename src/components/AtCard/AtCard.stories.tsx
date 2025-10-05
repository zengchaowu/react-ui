import type { Meta, StoryObj } from '@storybook/react'
import { AtCard } from './index'

const meta: Meta<typeof AtCard> = {
  title: 'Ant Design/AtCard',
  component: AtCard,
  args: {
    title: '卡片标题',
    children: '这里是卡片内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtCard> = {}