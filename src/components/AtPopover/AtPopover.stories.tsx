import type { Meta, StoryObj } from '@storybook/react'
import { AtPopover } from './index'

const meta: Meta<typeof AtPopover> = {
  title: 'Ant Design/AtPopover',
  component: AtPopover,
  args: {
    content: '这是 Popover 内容',
    title: '标题',
    children: '点击或悬停显示 Popover',
  },
}

export default meta
export const Basic: StoryObj<typeof AtPopover> = {}