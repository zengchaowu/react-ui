import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwNumberInput } from './CwNumberInput'

const meta: Meta<typeof CwNumberInput> = {
  title: '1. Components/Form/CwNumberInput',
  component: CwNumberInput,
  args: {
    placeholder: '请输入数字',
    clearable: true,
    allowDecimal: true,
    step: 1,
  },
}

export default meta
type Story = StoryObj<typeof CwNumberInput>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | string>(args.value ?? '')
    return (
      <div style={{ width: 240 }}>
        <CwNumberInput {...args} value={value} onChange={(next) => setValue(next)} />
        <div style={{ marginTop: 8, fontSize: 12 }}>当前值: {String(value)}</div>
      </div>
    )
  },
}

export const WithMinMax: Story = {
  args: {
    min: 0,
    max: 100,
    step: 5,
    placeholder: '0-100之间的数字',
  },
  render: (args) => {
    const [value, setValue] = useState<number | string>(10)
    return (
      <div style={{ width: 240 }}>
        <CwNumberInput {...args} value={value} onChange={(next) => setValue(next)} />
      </div>
    )
  },
}
