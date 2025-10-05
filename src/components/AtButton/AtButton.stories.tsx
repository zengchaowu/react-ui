import type { Meta, StoryObj } from '@storybook/react'
import { AtButton } from './index'

const meta: Meta<typeof AtButton> = {
  title: 'Ant Design/AtButton',
  component: AtButton,
  args: {
    children: '按钮',
    type: 'primary',
  },
}

export default meta
export const Primary: StoryObj<typeof AtButton> = {}