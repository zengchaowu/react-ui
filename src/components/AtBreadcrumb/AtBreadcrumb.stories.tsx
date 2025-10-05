import type { Meta, StoryObj } from '@storybook/react'
import { AtBreadcrumb } from './index'

const meta: Meta<typeof AtBreadcrumb> = {
  title: 'Ant Design/AtBreadcrumb',
  component: AtBreadcrumb,
  args: {
    items: [
      { title: '首页' },
      { title: '列表' },
    ],
  },
}

export default meta
export const Basic: StoryObj<typeof AtBreadcrumb> = {}