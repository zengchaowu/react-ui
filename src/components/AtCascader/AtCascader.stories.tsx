import type { Meta, StoryObj } from '@storybook/react'
import { AtCascader } from './index'

const meta: Meta<typeof AtCascader> = {
  title: 'Ant Design/AtCascader',
  component: AtCascader,
  args: {
    options: [
      { value: 'zhejiang', label: 'Zhejiang', children: [{ value: 'hangzhou', label: 'Hangzhou' }] },
      { value: 'jiangsu', label: 'Jiangsu', children: [{ value: 'nanjing', label: 'Nanjing' }] },
    ],
    placeholder: 'Please select',
  },
}

export default meta
export const Basic: StoryObj<typeof AtCascader> = {}