import type { Meta, StoryObj } from '@storybook/react'
import { AtDivider } from './index'

const meta: Meta<typeof AtDivider> = {
  title: 'Ant Design/AtDivider',
  component: AtDivider,
  args: {
    children: '分割线',
    orientation: 'center',
  },
}

export default meta
export const Basic: StoryObj<typeof AtDivider> = {}