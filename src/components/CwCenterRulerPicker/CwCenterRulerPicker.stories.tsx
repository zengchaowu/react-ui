import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCenterRulerPicker } from './CwCenterRulerPicker'
import type { CwCenterRulerPickerValue } from './types'

const meta: Meta<typeof CwCenterRulerPicker> = {
  title: '1. Components/Form/CwCenterRulerPicker',
  component: CwCenterRulerPicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '居中固定滑块 + 刻度横向滚动选择器。支持 options 或 min/max/step；拖动刻度使当前值对齐中心线。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number', min: 1 } },
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    tickWidthRem: { control: { type: 'number', min: 1, max: 4, step: 0.25 } },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof CwCenterRulerPicker>

function DefaultDemo() {
  const [value, setValue] = useState<CwCenterRulerPickerValue>(30)
  return (
    <div className="w-[min(22rem,92vw)] rounded-xl bg-[var(--bg-color-container)] p-4">
      <CwCenterRulerPicker
        value={value}
        onChange={(next) => setValue(next)}
        min={1}
        max={99}
        step={1}
        tickWidthRem={1.5}
        formatValue={(v) => `${v}px`}
        texts={{ ariaLabel: '字体大小' }}
      />
      <p className="mt-3 text-center text-xs text-[var(--text-color-secondary)]">
        当前值：{value}px
      </p>
    </div>
  )
}

export const Default: Story = {
  args: {
    min: 1,
    max: 99,
    step: 1,
    tickWidthRem: 1.5,
  },
  render: () => <DefaultDemo />,
}

function CustomOptionsDemo() {
  const [value, setValue] = useState<CwCenterRulerPickerValue>(30)
  const options = [23, 26, 28, 30, 32, 34, 38]
  return (
    <div className="w-[min(22rem,92vw)] rounded-xl bg-[var(--bg-color-container)] p-4">
      <CwCenterRulerPicker
        value={value}
        onChange={(next) => setValue(next)}
        options={options}
        formatValue={(v) => `${v}px`}
      />
    </div>
  )
}

export const CustomOptions: Story = {
  render: () => <CustomOptionsDemo />,
}

function ReadonlyDemo() {
  const [value, setValue] = useState<CwCenterRulerPickerValue>(30)
  return (
    <div className="w-[min(22rem,92vw)] rounded-xl bg-[var(--bg-color-container)] p-4">
      <CwCenterRulerPicker
        value={value}
        onChange={(next) => setValue(next)}
        readonly
        min={1}
        max={99}
        tickWidthRem={1.5}
      />
    </div>
  )
}

export const Readonly: Story = {
  args: { readonly: true, min: 1, max: 99, tickWidthRem: 1.5 },
  render: () => <ReadonlyDemo />,
}

function DisabledDemo() {
  const [value, setValue] = useState<CwCenterRulerPickerValue>(30)
  return (
    <div className="w-[min(22rem,92vw)] rounded-xl bg-[var(--bg-color-container)] p-4">
      <CwCenterRulerPicker
        value={value}
        onChange={(next) => setValue(next)}
        disabled
        min={1}
        max={99}
        tickWidthRem={1.5}
      />
    </div>
  )
}

export const Disabled: Story = {
  args: { disabled: true, min: 1, max: 99, tickWidthRem: 1.5 },
  render: () => <DisabledDemo />,
}
