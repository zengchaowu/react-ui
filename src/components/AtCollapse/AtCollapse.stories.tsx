import type { Meta, StoryObj } from '@storybook/react'
import { AtCollapse } from './index'

const meta: Meta<typeof AtCollapse> = {
  title: 'At/AtCollapse',
  component: AtCollapse,
  args: {
    items: [
      { key: '1', label: '面板 1', children: '面板 1 内容' },
      { key: '2', label: '面板 2', children: '面板 2 内容' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtCollapse> = {}