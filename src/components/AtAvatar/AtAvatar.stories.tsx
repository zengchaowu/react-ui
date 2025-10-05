import type { Meta, StoryObj } from '@storybook/react'
import { AtAvatar } from './index'

const meta: Meta<typeof AtAvatar> = {
  title: 'Ant Design/AtAvatar',
  component: AtAvatar,
  args: {
    children: 'A',
    shape: 'circle',
  },
}

export default meta
export const Basic: StoryObj<typeof AtAvatar> = {}