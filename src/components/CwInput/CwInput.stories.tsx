import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwInput } from './CwInput'
import type { CwInputAppearance, CwInputProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const searchIcon = (
  <svg
    className="w-4 h-4 text-[var(--text-color-secondary)]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const userIcon = (
  <svg
    className="w-4 h-4 text-[var(--text-color-secondary)]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const meta: Meta<typeof CwInput> = {
  title: '1. Components/Form/CwInput',
  component: CwInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '支持 icon / suffix；prefix 通过 JS 注入 input 展示值（如 1 显示 ¥1），modelValue 不含 prefix，空值不显示 ¥。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    clearable: {
      control: { type: 'boolean' },
    },
    showLabel: {
      control: { type: 'boolean' },
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: '文本对齐方式',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '输入框尺寸',
    },
    appearance: {
      control: { type: 'select' },
      options: [
        'default',
        'pill',
        'search',
        'glass-rounded',
        'pill-compact',
        'surface-light',
        'surface-dark',
        'embedded',
        'plain',
        'compact',
      ],
      description: '官方外观',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwInput>

function DefaultDemo(args: CwInputProps) {
  const [value, setValue] = useState('')
  return <CwInput {...args} value={value} onChange={setValue} />
}

function StatesDemo(args: CwInputProps) {
  const [value, setValue] = useState('')
  return <CwInput {...args} value={value} onChange={setValue} iconSlot={searchIcon} />
}

function ReadonlyDemo(args: CwInputProps) {
  const [value, setValue] = useState('readonly value')
  return <CwInput {...args} value={value} onChange={setValue} iconSlot={userIcon} />
}

function DisabledDemo(args: CwInputProps) {
  const [value, setValue] = useState('disabled value')
  return <CwInput {...args} value={value} onChange={setValue} iconSlot={userIcon} />
}

function MultipleDemo() {
  const [v1, setV1] = useState('')
  const [v2, setV2] = useState('只读')
  const [v3, setV3] = useState('禁用')
  return (
    <div className="w-[26.25rem] p-6 flex flex-col gap-4">
      <CwInput value={v1} onChange={setV1} placeholder="默认" clearable />
      <CwInput value={v2} onChange={setV2} placeholder="只读" readonly />
      <CwInput value={v3} onChange={setV3} placeholder="禁用" disabled />
    </div>
  )
}

function WithPrefixDemo() {
  const [amount, setAmount] = useState('12.50')
  return (
    <div className="w-[20rem] p-4 flex flex-col gap-4">
      <div className="text-sm text-[var(--text-color-secondary)]">
        金额（空不显示 ¥，输入 1 后 input 内为 ¥1）
      </div>
      <CwInput
        value={amount}
        onChange={setAmount}
        prefix="¥"
        align="right"
        placeholder="0.00"
        clearable={false}
      />
    </div>
  )
}

function TextAlignDemo() {
  const [left, setLeft] = useState('左对齐文本')
  const [right, setRight] = useState('右对齐文本')
  return (
    <div className="w-[26.25rem] p-6 flex flex-col gap-4">
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">左对齐（默认）</div>
        <CwInput value={left} onChange={setLeft} placeholder="请输入内容" align="left" clearable />
      </div>
      <div>
        <div className="text-sm text-[var(--text-color-secondary)] mb-2">右对齐</div>
        <CwInput
          value={right}
          onChange={setRight}
          placeholder="请输入内容"
          align="right"
          clearable
        />
      </div>
    </div>
  )
}

const slotStoryArgs = {
  placeholder: '请输入搜索关键词',
  clearable: true,
}

function WithSlotsDemo() {
  const [valueIcon, setValueIcon] = useState('')
  const [valueClear, setValueClear] = useState('可清除的文本')
  const [valueSuffix, setValueSuffix] = useState('')
  return (
    <div className="flex w-[20rem] flex-col gap-8">
      <SlotStorySection slot="icon">
        <CwInput
          {...slotStoryArgs}
          value={valueIcon}
          onChange={setValueIcon}
          iconSlot={searchIcon}
        />
      </SlotStorySection>
      <SlotStorySection slot="clear">
        <CwInput
          {...slotStoryArgs}
          value={valueClear}
          onChange={setValueClear}
          clearSlot={
            <span className="cursor-pointer text-xs text-[var(--brand-color-6)]">清空</span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="prefix">
        <CwInput
          {...slotStoryArgs}
          value={valueIcon}
          onChange={setValueIcon}
          prefix="¥"
          align="right"
          clearable={false}
        />
      </SlotStorySection>
      <SlotStorySection slot="suffix">
        <CwInput
          {...slotStoryArgs}
          value={valueSuffix}
          onChange={setValueSuffix}
          suffixSlot={
            <span className="text-xs text-[var(--text-color-placeholder)]">个</span>
          }
        />
      </SlotStorySection>
    </div>
  )
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo(args: CwInputProps) {
  const [small, setSmall] = useState('')
  const [medium, setMedium] = useState('')
  const [large, setLarge] = useState('')
  const values = { small, medium, large }
  const setters = { small: setSmall, medium: setMedium, large: setLarge }
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <CwInput
            key={item.value}
            {...args}
            value={values[item.value]}
            onChange={setters[item.value]}
            size={item.value}
            placeholder={`${item.label}输入框`}
          />
        ))}
      </div>
    </div>
  )
}

function AppearanceInput(args: CwInputProps) {
  const [value, setValue] = useState('')
  return (
    <div className="w-[28rem]">
      <CwInput {...args} value={value} onChange={setValue} className="w-full" />
    </div>
  )
}

function appearanceInputStory(appearance: Exclude<CwInputAppearance, 'default'>): Story {
  return {
    args: {
      appearance,
      placeholder: appearance,
    },
    render: (args) => <AppearanceInput {...args} />,
  }
}

export const States: Story = {
  args: {
    placeholder: '请输入搜索关键词',
    label: '用户名',
    clearable: true,
    showLabel: true,
  },
  render: (args) => <StatesDemo {...args} />,
}

export const Readonly: Story = {
  args: {
    placeholder: '请输入内容',
    readonly: true,
    label: '只读状态',
    showLabel: true,
    clearable: true,
  },
  render: (args) => <ReadonlyDemo {...args} />,
}

export const Disabled: Story = {
  args: {
    placeholder: '请输入内容',
    disabled: true,
    label: '禁用状态',
    showLabel: true,
    clearable: true,
  },
  render: (args) => <DisabledDemo {...args} />,
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
}

export const WithPrefix: Story = {
  render: () => <WithPrefixDemo />,
}

export const TextAlign: Story = {
  render: () => <TextAlignDemo />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

export const Sizes: Story = {
  args: {
    placeholder: '请输入内容',
    clearable: true,
  },
  render: (args) => <SizesDemo {...args} />,
}

export const AppearancePill: Story = appearanceInputStory('pill')
export const AppearanceSearch: Story = appearanceInputStory('search')
export const AppearanceGlassRounded: Story = appearanceInputStory('glass-rounded')
export const AppearancePillCompact: Story = appearanceInputStory('pill-compact')
export const AppearanceSurfaceLight: Story = appearanceInputStory('surface-light')
export const AppearanceSurfaceDark: Story = appearanceInputStory('surface-dark')
export const AppearanceEmbedded: Story = appearanceInputStory('embedded')
export const AppearancePlain: Story = appearanceInputStory('plain')
export const AppearanceCompact: Story = appearanceInputStory('compact')
