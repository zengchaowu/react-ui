import type { Meta, StoryObj } from '@storybook/react'
import { CwTextarea } from './CwTextarea'

const meta: Meta<typeof CwTextarea> = {
  title: '1. Components/Form/CwTextarea',
  component: CwTextarea,
  args: {
    placeholder: '请输入内容',
    rows: 4,
  },
}

export default meta
type Story = StoryObj<typeof CwTextarea>

export const Default: Story = {
  args: {
    value: '',
    label: '文本内容',
    showLabel: true,
    showCount: true,
    maxlength: 200,
  },
}
