import type { Meta, StoryObj } from '@storybook/react'
import { AtInput } from './index'

const meta: Meta<typeof AtInput> = {
  title: 'Ant Design/AtInput',
  component: AtInput,
  args: {
    placeholder: '请输入',
    allowClear: true,
  },
}

export default meta
export const Basic: StoryObj<typeof AtInput> = {}