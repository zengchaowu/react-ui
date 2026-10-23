import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import type { CwSliderProps } from './types'
import { CwSlider } from './CwSlider'

const meta: Meta<typeof CwSlider> = {
  title: '1. Components/Form/CwSlider',
  component: CwSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '自研 Slider 组件，支持键盘、聚焦环、禁用与只读。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '滑块尺寸',
    },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ControlledSlider(props: CwSliderProps) {
  const [value, setValue] = useState(props.value ?? 30)

  useEffect(() => {
    if (props.value !== undefined) setValue(props.value)
  }, [props.value])

  return <CwSlider {...props} value={value} onChange={setValue} />
}

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => <ControlledSlider {...args} />,
}

export const Readonly: Story = {
  args: {
    min: 0,
    max: 100,
    step: 5,
    readonly: true,
    value: 50,
  },
  render: (args) => <ControlledSlider {...args} />,
}

export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    step: 10,
    disabled: true,
    value: 70,
  },
  render: (args) => <ControlledSlider {...args} />,
}

const sizeOptions = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo(args: CwSliderProps) {
  const [values, setValues] = useState({ small: 30, medium: 50, large: 70 })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizeOptions.map((item) => (
          <div key={item.value} className="flex flex-col gap-2">
            <div className="text-xs text-[var(--text-color-secondary)]">{item.label}</div>
            <CwSlider
              {...args}
              size={item.value}
              value={values[item.value]}
              onChange={(next) => setValues((prev) => ({ ...prev, [item.value]: next }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const Sizes: Story = {
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => <SizesDemo {...args} />,
}
