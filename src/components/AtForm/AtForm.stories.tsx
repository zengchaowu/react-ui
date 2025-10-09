import type { Meta, StoryObj } from '@storybook/react'
import { AtForm, AtFormItem } from './index'
import { AtInput } from '../AtInput'

const meta: Meta<typeof AtForm> = {
  title: 'At/AtForm',
  component: AtForm,
  args: {
    layout: 'vertical',
  },
}

export default meta
export const Basic: StoryObj<typeof AtForm> = {
  render: (args) => (
    <AtForm {...args}>
      <AtFormItem label="用户名" name="username">
        <AtInput placeholder="请输入用户名" />
      </AtFormItem>
    </AtForm>
  ),
}