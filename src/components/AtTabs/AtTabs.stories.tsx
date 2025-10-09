import type { Meta, StoryObj } from '@storybook/react'
import { AtTabs } from './index'

const meta: Meta<typeof AtTabs> = {
  title: 'At/AtTabs',
  component: AtTabs,
  args: {
    defaultActiveKey: '1',
    items: [
      { key: '1', label: 'Tab 1', children: '内容 1' },
      { key: '2', label: 'Tab 2', children: '内容 2' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtTabs> = {}