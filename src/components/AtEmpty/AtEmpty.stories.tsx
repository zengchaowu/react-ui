import type { Meta, StoryObj } from '@storybook/react'
import { AtEmpty } from './index'

const meta: Meta<typeof AtEmpty> = {
  title: 'At/AtEmpty',
  component: AtEmpty,
  args: {
    description: '暂无数据',
  },
}

export default meta
export const Basic: StoryObj<typeof AtEmpty> = {}