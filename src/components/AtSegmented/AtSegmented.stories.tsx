import type { Meta, StoryObj } from '@storybook/react'
import { AtSegmented } from './index'

const meta: Meta<typeof AtSegmented> = {
  title: 'Ant Design/AtSegmented',
  component: AtSegmented,
  args: {
    options: ['日', '周', '月'],
    defaultValue: '日',
  },
}

export default meta
export const Basic: StoryObj<typeof AtSegmented> = {}