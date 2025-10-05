import type { Meta, StoryObj } from '@storybook/react'
import { AtAlert } from './index'

const meta: Meta<typeof AtAlert> = {
  title: 'Ant Design/AtAlert',
  component: AtAlert,
  args: {
    message: '信息提示',
    description: '这是一条基础的 Alert 提示信息',
    type: 'info',
    showIcon: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtAlert> = {}