import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwNumberInput } from './CwNumberInput'
import type { CwNumberInputProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { numberControlArgType } from '../../storybook/argTypes'

const meta: Meta<typeof CwNumberInput> = {
  title: '1. Components/Form/CwNumberInput',
  component: CwNumberInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '基于 CwInput 的数字输入框组件，限制只能输入数字，支持最小值、最大值、步进值等配置。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: numberControlArgType({
      description: '输入框的值（数字）',
    }),
    min: numberControlArgType({ description: '最小值' }),
    max: numberControlArgType({ description: '最大值' }),
    step: numberControlArgType({ description: '步进值' }),
    allowDecimal: {
      control: { type: 'boolean' },
      description: '是否允许小数',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    clearable: {
      control: { type: 'boolean' },
      description: '是否显示清除按钮',
    },
    showLabel: {
      control: { type: 'boolean' },
      description: '是否显示标签',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: '文本对齐方式',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '输入框尺寸',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'compact', 'plain', 'pill-compact', 'embedded'],
      description: '官方外观（与 CwInput 共用）',
    },
    placeholder: {
      control: { type: 'text' },
      description: '占位符',
    },
  },
  args: {
    placeholder: '请输入数字',
    clearable: true,
    allowDecimal: true,
    readonly: false,
    disabled: false,
    showLabel: false,
    align: 'left',
    size: 'medium',
    appearance: 'default',
  },
}

export default meta
type Story = StoryObj<typeof CwNumberInput>

function ValueHintDemo(args: CwNumberInputProps & { hint?: string }) {
  const { hint, ...inputArgs } = args
  const [value, setValue] = useState<number | string>(args.value ?? '')

  return (
    <div className="w-64">
      <CwNumberInput {...inputArgs} value={value} onChange={setValue} />
      <div className="mt-2 text-sm text-[var(--text-color-secondary)]">
        当前值: {String(value)}
        {hint ? ` ${hint}` : ''}
      </div>
    </div>
  )
}

function StatesDemo() {
  const [normal, setNormal] = useState<number | string>(42)
  const [disabled, setDisabled] = useState<number | string>(42)
  const [readonly, setReadonly] = useState<number | string>(42)

  return (
    <div className="space-y-4 w-64">
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">正常状态</div>
        <CwNumberInput value={normal} onChange={setNormal} placeholder="请输入数字" />
      </div>
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">禁用状态</div>
        <CwNumberInput
          value={disabled}
          onChange={setDisabled}
          disabled
          placeholder="请输入数字"
        />
      </div>
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">只读状态</div>
        <CwNumberInput
          value={readonly}
          onChange={setReadonly}
          readonly
          placeholder="请输入数字"
        />
      </div>
    </div>
  )
}

const slotStoryArgs = {
  placeholder: '金额',
  clearable: true,
}

function IconSlotDemo() {
  const [value, setValue] = useState<number | string>('')
  return (
    <CwNumberInput
      {...slotStoryArgs}
      value={value}
      onChange={setValue}
      iconSlot={<span className="text-sm text-[var(--text-color-secondary)]">¥</span>}
    />
  )
}

function ClearSlotDemo() {
  const [value, setValue] = useState<number | string>(128)
  return (
    <CwNumberInput
      {...slotStoryArgs}
      value={value}
      onChange={setValue}
      clearSlot={
        <span className="cursor-pointer text-xs text-[var(--brand-color-6)]">清空</span>
      }
    />
  )
}

function SuffixSlotDemo() {
  const [value, setValue] = useState<number | string>('')
  return (
    <CwNumberInput
      {...slotStoryArgs}
      value={value}
      onChange={setValue}
      suffixSlot={
        <span className="text-xs text-[var(--text-color-placeholder)]">元</span>
      }
    />
  )
}

function SizesDemo(args: CwNumberInputProps) {
  const sizes = [
    { value: 'small', label: '小号' },
    { value: 'medium', label: '中号' },
    { value: 'large', label: '大号' },
  ] as const
  const [values, setValues] = useState<Record<string, number | string>>({
    small: '',
    medium: '',
    large: '',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <CwNumberInput
            key={item.value}
            {...args}
            value={values[item.value]}
            onChange={(next) =>
              setValues((prev) => ({ ...prev, [item.value]: next }))
            }
            size={item.value}
            placeholder={`${item.label}数字输入框`}
          />
        ))}
      </div>
    </div>
  )
}

function CompactDemo(args: CwNumberInputProps) {
  const [value, setValue] = useState<number | string>(args.value ?? 0.7)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-color-secondary)]">温度</span>
      <CwNumberInput {...args} className="w-10" value={value} onChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  args: {
    value: '',
  },
  render: (args) => <ValueHintDemo {...args} />,
}

export const WithMinMax: Story = {
  args: {
    value: 10,
    min: 0,
    max: 100,
    placeholder: '0-100之间的数字',
  },
  render: (args) => <ValueHintDemo {...args} hint="(范围: 0-100)" />,
}

export const IntegerOnly: Story = {
  args: {
    value: 5,
    allowDecimal: false,
    placeholder: '只能输入整数',
  },
  render: (args) => <ValueHintDemo {...args} hint="(仅整数)" />,
}

export const WithStep: Story = {
  args: {
    value: 0,
    min: 0,
    max: 100,
    step: 5,
    placeholder: '步进值为5',
  },
  render: (args) => <ValueHintDemo {...args} hint="(步进: 5)" />,
}

export const States: Story = {
  render: () => <StatesDemo />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[17.5rem] flex-col gap-8">
      <SlotStorySection slot="icon">
        <IconSlotDemo />
      </SlotStorySection>
      <SlotStorySection slot="clear">
        <ClearSlotDemo />
      </SlotStorySection>
      <SlotStorySection slot="suffix">
        <SuffixSlotDemo />
      </SlotStorySection>
    </div>
  ),
}

export const Sizes: Story = {
  args: {
    placeholder: '请输入数字',
    clearable: true,
  },
  render: (args) => <SizesDemo {...args} />,
}

/** 工具栏紧凑数字框（如 AI 温度）；宽度由外层 class 控制 */
export const Compact: Story = {
  args: {
    value: 0.7,
    appearance: 'compact',
    min: 0,
    max: 2,
    step: 0.1,
    clearable: false,
    align: 'center',
  },
  render: (args) => <CompactDemo {...args} />,
}
