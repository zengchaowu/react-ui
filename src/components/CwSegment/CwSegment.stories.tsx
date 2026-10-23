import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSegment } from './CwSegment'

const meta: Meta<typeof CwSegment> = {
  title: '1. Components/Navigation/CwSegment',
  component: CwSegment,
  args: {
    options: [
      { label: '短信登录', value: 'sms' },
      { label: '密码登录', value: 'password' },
    ],
  },
}

export default meta
type Story = StoryObj<typeof CwSegment>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | number>('sms')
    return <CwSegment {...args} value={value} onChange={setValue} />
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const StringOptions: Story = {
  args: {
    options: ['选项 A', '选项 B', '选项 C'],
  },
}
