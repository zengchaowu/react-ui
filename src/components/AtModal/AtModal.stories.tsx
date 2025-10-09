import type { Meta, StoryObj } from '@storybook/react'
import { AtModal } from './index'

const meta: Meta<typeof AtModal> = {
  title: 'At/AtModal',
  component: AtModal,
  args: {
    open: true,
    title: 'At/AtModal',
    children: '内容',
  },
}

export default meta
export const Basic: StoryObj<typeof AtModal> = {}