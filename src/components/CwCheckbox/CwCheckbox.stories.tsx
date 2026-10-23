import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCheckbox } from './CwCheckbox'
import type { CwCheckboxProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

type CheckboxValue = boolean | 'indeterminate'

const meta: Meta<typeof CwCheckbox> = {
  title: '1. Components/Form/CwCheckbox',
  component: CwCheckbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '自研复选框组件，支持选中、未选中和半选中三种状态，参照 shadcn 设计风格。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'select' },
      options: [false, true, 'indeterminate'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '复选框尺寸',
    },
    onChange: { action: 'change' },
  },
}

export default meta
type Story = StoryObj<typeof CwCheckbox>

function CheckboxStates({
  args,
  labels,
}: {
  args: CwCheckboxProps
  labels: [string, string, string]
}) {
  const [checked1, setChecked1] = useState<CheckboxValue>(false)
  const [checked2, setChecked2] = useState<CheckboxValue>(true)
  const [checked3, setChecked3] = useState<CheckboxValue>('indeterminate')
  return (
    <div className="flex flex-col gap-4">
      <CwCheckbox {...args} value={checked1} onChange={setChecked1}>
        {labels[0]}
      </CwCheckbox>
      <CwCheckbox {...args} value={checked2} onChange={setChecked2}>
        {labels[1]}
      </CwCheckbox>
      <CwCheckbox {...args} value={checked3} onChange={setChecked3}>
        {labels[2]}
      </CwCheckbox>
    </div>
  )
}

export const States: Story = {
  args: {},
  render: (args) => <CheckboxStates args={args} labels={['未选中', '已选中', '半选中']} />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

function WithSlotsDemo() {
  const [checked, setChecked] = useState<CheckboxValue>(false)
  return (
    <SlotStorySection slot="default">
      <CwCheckbox value={checked} onChange={setChecked}>
        <span className="text-sm">
          同意
          <a
            href="#"
            className="text-[var(--brand-color-6)]"
            onClick={(event) => event.preventDefault()}
          >
            服务条款
          </a>
        </span>
      </CwCheckbox>
    </SlotStorySection>
  )
}

export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => (
    <CheckboxStates
      args={args}
      labels={['未选中（只读）', '已选中（只读）', '半选中（只读）']}
    />
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <CheckboxStates
      args={args}
      labels={['未选中（禁用）', '已选中（禁用）', '半选中（禁用）']}
    />
  ),
}

export const AppearanceBlock: Story = {
  render: () => <AppearanceBlockDemo />,
}

function AppearanceBlockDemo() {
  const [checked, setChecked] = useState<CheckboxValue>(false)
  return (
    <CwCheckbox value={checked} onChange={setChecked} appearance="block">
      全宽块级复选框（如 Select 全选行）
    </CwCheckbox>
  )
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

export const Sizes: Story = {
  args: {},
  render: (args) => <SizesDemo args={args} />,
}

function SizesDemo({ args }: { args: CwCheckboxProps }) {
  const [checked, setChecked] = useState<Record<string, CheckboxValue>>({
    small: false,
    medium: true,
    large: 'indeterminate',
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value}>
            <div className="text-xs text-[var(--text-color-secondary)] mb-2">{item.label}</div>
            <div className="flex flex-col gap-2">
              <CwCheckbox
                {...args}
                size={item.value}
                value={checked[item.value]}
                onChange={(next) =>
                  setChecked((prev) => ({ ...prev, [item.value]: next }))
                }
              >
                {item.label}复选框
              </CwCheckbox>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
