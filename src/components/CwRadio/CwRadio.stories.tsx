import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwRadio } from './CwRadio'
import type { CwRadioProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwRadio> = {
  title: '1. Components/Form/CwRadio',
  component: CwRadio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '自研单选组件（独立使用版），支持聚焦环、键盘操作、禁用与只读。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    border: {
      control: { type: 'boolean' },
    },
    highlightSelected: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '单选框尺寸',
    },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof CwRadio>

function RadioPair({
  args,
  uncheckedLabel,
  checkedLabel,
}: {
  args: CwRadioProps
  uncheckedLabel: string
  checkedLabel: string
}) {
  const [v1, setV1] = useState(false)
  const [v2, setV2] = useState(true)
  return (
    <div className="flex flex-col gap-4">
      <CwRadio {...args} value={v1} onChange={setV1}>
        {uncheckedLabel}
      </CwRadio>
      <CwRadio {...args} value={v2} onChange={setV2}>
        {checkedLabel}
      </CwRadio>
    </div>
  )
}

export const States: Story = {
  args: {},
  render: (args) => (
    <RadioPair args={args} uncheckedLabel="未选中" checkedLabel="已选中" />
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

function WithSlotsDemo() {
  const [checked, setChecked] = useState(true)
  return (
    <SlotStorySection slot="default">
      <CwRadio value={checked} onChange={setChecked}>
        <span className="text-sm font-medium text-[var(--text-color-primary)]">
          推荐方案（含赠险）
        </span>
      </CwRadio>
    </SlotStorySection>
  )
}

export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => (
    <RadioPair args={args} uncheckedLabel="未选中（只读）" checkedLabel="已选中（只读）" />
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <RadioPair args={args} uncheckedLabel="未选中（禁用）" checkedLabel="已选中（禁用）" />
  ),
}

export const Bordered: Story = {
  args: {
    border: true,
  },
  render: (args) => (
    <RadioPair args={args} uncheckedLabel="未选中（带边框）" checkedLabel="已选中（带边框）" />
  ),
}

export const HighlightSelected: Story = {
  args: {
    highlightSelected: true,
  },
  render: (args) => (
    <RadioPair args={args} uncheckedLabel="未选中（文本默认）" checkedLabel="已选中（文本高亮）" />
  ),
}

export const Sizes: Story = {
  args: {},
  render: (args) => <SizesDemo args={args} />,
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo({ args }: { args: CwRadioProps }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    small: false,
    medium: true,
    large: false,
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value}>
            <div className="text-xs text-[var(--text-color-secondary)] mb-2">{item.label}</div>
            <div className="flex flex-col gap-2">
              <CwRadio
                {...args}
                size={item.value}
                value={checked[item.value]}
                onChange={(next) =>
                  setChecked((prev) => ({ ...prev, [item.value]: next }))
                }
              >
                {item.label}单选框
              </CwRadio>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
