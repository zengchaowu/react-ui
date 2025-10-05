import type { Meta, StoryObj } from '@storybook/react'
import { AtTextArea } from './index'

const meta: Meta<typeof AtTextArea> = {
  title: 'Ant Design/AtTextArea',
  component: AtTextArea,
  args: {
    rows: 4,
    placeholder: '请输入文本...',
    defaultValue: '一些示例文本',
  },
}

export default meta
export const Basic: StoryObj<typeof AtTextArea> = {}