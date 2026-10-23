import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSearchBar } from './CwSearchBar'

const meta: Meta<typeof CwSearchBar> = {
  title: '1. Components/Form/CwSearchBar',
  component: CwSearchBar,
  args: {
    placeholder: '请输入客户名称',
    buttonText: '查询',
  },
}

export default meta
type Story = StoryObj<typeof CwSearchBar>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <div className="p-4">
        <CwSearchBar {...args} value={value} onChange={setValue} />
        <div className="mt-4 text-sm text-[var(--text-color-placeholder)]">
          当前值: {value}
        </div>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
