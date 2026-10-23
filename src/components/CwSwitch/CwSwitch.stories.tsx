import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSwitch } from './CwSwitch'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwSwitch> = {
  title: '1. Components/Form/CwSwitch',
  component: CwSwitch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '自研 Switch 组件，支持聚焦环、键盘操作、禁用与只读。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '开关尺寸',
    },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof CwSwitch>

function StatesDemo({ disabled, readonly }: { disabled?: boolean; readonly?: boolean }) {
  const [v1, setV1] = useState(false)
  const [v2, setV2] = useState(true)
  return (
    <div className="flex flex-col gap-4">
      <CwSwitch value={v1} disabled={disabled} readonly={readonly} onChange={setV1}>
        未开启
      </CwSwitch>
      <CwSwitch value={v2} disabled={disabled} readonly={readonly} onChange={setV2}>
        已开启
      </CwSwitch>
    </div>
  )
}

export const States: Story = {
  render: () => <StatesDemo />,
}

function WithSlotsDemo() {
  const [enabled, setEnabled] = useState(true)
  return (
    <SlotStorySection slot="default">
      <CwSwitch value={enabled} onChange={setEnabled}>
        <span className="text-sm text-[var(--text-color-primary)]">接收消息通知</span>
      </CwSwitch>
    </SlotStorySection>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => <StatesDemo disabled={args.disabled} readonly={args.readonly} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <StatesDemo disabled={args.disabled} readonly={args.readonly} />,
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo() {
  const [checked, setChecked] = useState({ small: false, medium: false, large: false })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <CwSwitch
            key={item.value}
            value={checked[item.value]}
            size={item.value}
            onChange={(next) => setChecked((prev) => ({ ...prev, [item.value]: next }))}
          >
            {item.label}开关
          </CwSwitch>
        ))}
      </div>
    </div>
  )
}

export const Sizes: Story = {
  render: () => <SizesDemo />,
}
