import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { CwProgressProps } from './types'
import { CwProgress } from './CwProgress'

const meta: Meta<typeof CwProgress> = {
  title: '1. Components/Display/CwProgress',
  component: CwProgress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '可交互进度条，默认纵向，自底向上填充；用于温度等紧凑参数调节。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: { type: 'number' },
      description: '最小值',
    },
    max: {
      control: { type: 'number' },
      description: '最大值',
    },
    step: {
      control: { type: 'number' },
      description: '步进',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: '方向',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '尺寸',
    },
    texts: {
      control: false,
      description: '自定义文案',
    },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof CwProgress>

function TemperatureProgressDemo(args: CwProgressProps) {
  const [value, setValue] = useState(0.7)
  return (
    <div className="flex items-end gap-3 text-sm text-[var(--text-color-secondary)]">
      <CwProgress {...args} value={value} texts={{ sliderLabel: '温度' }} onChange={setValue} />
      <span>{value.toFixed(1)}</span>
    </div>
  )
}

export const Default: Story = {
  args: {
    min: 0,
    max: 2,
    step: 0.1,
    direction: 'vertical',
    size: 'medium',
    disabled: false,
    readonly: false,
  },
  render: (args) => <TemperatureProgressDemo {...args} />,
}
