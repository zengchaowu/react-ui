import type { Meta, StoryObj } from '@storybook/react'
import { AtDrawer } from './index'

const meta: Meta<typeof AtDrawer> = {
  title: 'Ant Design/AtDrawer',
  component: AtDrawer,
  args: {
    open: true,
    title: '标题',
    children: '内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtDrawer> = {}