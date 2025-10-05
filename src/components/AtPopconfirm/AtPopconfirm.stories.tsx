import type { Meta, StoryObj } from '@storybook/react'
import { AtPopconfirm } from './index'

const meta: Meta<typeof AtPopconfirm> = {
  title: 'Ant Design/AtPopconfirm',
  component: AtPopconfirm,
  args: {
    title: 'Are you sure to delete this task?',
    okText: 'Yes',
    cancelText: 'No',
    children: 'Click me',
  },
}

export default meta
export const Basic: StoryObj<typeof AtPopconfirm> = {}