import type { Meta, StoryObj } from '@storybook/react'
import { AtDrawer } from './index'

const meta: Meta<typeof AtDrawer> = {
  title: 'At/AtDrawer',
  component: AtDrawer,
  args: {
    open: true,
    title: 'At/AtDrawer',
    children: '内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtDrawer> = {}