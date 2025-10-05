import type { Meta, StoryObj } from '@storybook/react'
import { AtModal } from './index'

const meta: Meta<typeof AtModal> = {
  title: 'Ant Design/AtModal',
  component: AtModal,
  args: {
    open: true,
    title: '标题',
    children: '内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtModal> = {}