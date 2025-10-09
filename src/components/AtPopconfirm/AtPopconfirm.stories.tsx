import type { Meta, StoryObj } from '@storybook/react'
import { AtPopconfirm } from './index'

const meta: Meta<typeof AtPopconfirm> = {
  title: 'At/AtPopconfirm',
  component: AtPopconfirm,
  args: {
    title: 'At/AtPopconfirm',
    okText: 'Yes',
    cancelText: 'No',
    children: 'Click me',
  },
}

export default meta
export const Basic: StoryObj<typeof AtPopconfirm> = {}