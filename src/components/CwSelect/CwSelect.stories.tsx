import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSelect } from './CwSelect'
import type { CwSelectOption, CwSelectProps, CwSelectValue } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwSelect> = {
  title: '1. Components/Form/CwSelect',
  component: CwSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'CwSelect 是基于 CwPopup 实现的选择器组件，支持搜索、清除等功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '绑定值',
    },
    placeholder: {
      control: { type: 'text' },
      description: '占位文本',
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
      description: '是否可清除',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '选择器尺寸',
    },
    inputAppearance: {
      control: { type: 'select' },
      options: [
        'default',
        'plain',
        'embedded',
        'pill',
        'search',
        'glass-rounded',
        'pill-compact',
        'surface-light',
        'surface-dark',
        'compact',
      ],
      description: '触发器 CwInput 外观（CellForm 用 plain）',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'right', 'center'],
      description: '触发器文本对齐',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwSelect>

// 默认选项数据
const defaultOptions: CwSelectOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' },
  { label: '菠萝', value: 'pineapple' },
  { label: '梨子', value: 'pear' },
  { label: '草莓', value: 'strawberry' },
  { label: '蓝莓', value: 'blueberry' },
  { label: '樱桃', value: 'cherry' },
  { label: '桃子', value: 'peach' },
  { label: '榴莲', value: 'durian' },
  { label: '芒果', value: 'mango' },
  { label: '火龙果', value: 'dragonfruit' },
  { label: '荔枝', value: 'lychee' },
  { label: '龙眼', value: 'longan' },
  { label: '椰子', value: 'coconut' },
]

type SelectValue = CwSelectValue | CwSelectValue[] | null

function ControlledSelect({
  initialValue,
  ...args
}: Omit<Partial<CwSelectProps>, 'value'> & { initialValue: SelectValue }) {
  const [value, setValue] = useState<SelectValue>(initialValue)
  return <CwSelect {...args} value={value} onChange={setValue} />
}

function MultipleSelectDemo({ ...args }: Partial<CwSelectProps>) {
  const [value, setValue] = useState<SelectValue>(['apple', 'orange'])
  const selected = Array.isArray(value) ? value.join(', ') : String(value ?? '')
  return (
    <div className="w-[26.25rem]">
      <CwSelect
        {...args}
        value={value}
        onChange={(next, option) => {
          setValue(next)
          console.log('Change:', next, option)
        }}
        onTagClick={(option) => console.log('Tag click:', option)}
        onTagClose={(option) => console.log('Tag close:', option)}
      />
      <div className="mt-4 text-sm text-[var(--text-color-secondary)]">已选择: {selected}</div>
    </div>
  )
}

function MultipleWithMaxRowsDemo({ ...args }: Partial<CwSelectProps>) {
  const [value, setValue] = useState<SelectValue>([
    'apple',
    'banana',
    'orange',
    'grape',
    'watermelon',
  ])
  const count = Array.isArray(value) ? value.length : 0
  return (
    <div className="w-[26.25rem]">
      <CwSelect
        {...args}
        value={value}
        onChange={setValue}
        onMoreClick={() => console.log('More clicked')}
      />
      <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
        已选择: {count} 个选项
      </div>
    </div>
  )
}

function MultipleSelectAllDemo({ ...args }: Partial<CwSelectProps>) {
  const [value, setValue] = useState<SelectValue>(defaultOptions.map((opt) => opt.value))
  const [isSelectAll, setIsSelectAll] = useState(true)
  const count = Array.isArray(value) ? value.length : 0
  return (
    <div className="w-[26.25rem]">
      <CwSelect
        {...args}
        value={value}
        selectAll={isSelectAll}
        onSelectAllChange={setIsSelectAll}
        onChange={(next) => {
          setValue(next)
          console.log('Change:', Array.isArray(next) ? next.length : 0, 'selected')
        }}
      />
      <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
        全选状态: {isSelectAll ? '是' : '否'}，已选择: {count} /{' '}
        {(args.options ?? defaultOptions).length} 个选项
      </div>
    </div>
  )
}

function AppearanceSelectDemo({
  inputAppearance,
  ...args
}: Partial<CwSelectProps>) {
  const [value, setValue] = useState<SelectValue>(null)
  return (
    <div className="flex w-[28rem] items-center gap-3">
      <span className="w-12 shrink-0 text-sm text-[var(--text-color-secondary)]">水果</span>
      <div
        className={
          inputAppearance === 'plain' ? 'flex min-w-0 flex-1 justify-end' : 'min-w-0 flex-1'
        }
      >
        <CwSelect
          {...args}
          inputAppearance={inputAppearance}
          value={value}
          onChange={setValue}
        />
      </div>
    </div>
  )
}

function SelectSizesDemo({ ...args }: Partial<CwSelectProps>) {
  const sizes = [
    { value: 'small', label: '小号' },
    { value: 'medium', label: '中号' },
    { value: 'large', label: '大号' },
  ] as const
  const [smallValue, setSmallValue] = useState<SelectValue>('')
  const [mediumValue, setMediumValue] = useState<SelectValue>('')
  const [largeValue, setLargeValue] = useState<SelectValue>('')
  const values = { small: smallValue, medium: mediumValue, large: largeValue }
  const setters = { small: setSmallValue, medium: setMediumValue, large: setLargeValue }
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <CwSelect
            key={item.value}
            {...args}
            size={item.value}
            placeholder={`${item.label}选择器`}
            value={values[item.value]}
            onChange={(next) => setters[item.value](next)}
          />
        ))}
      </div>
    </div>
  )
}

function appearanceSelectStory(inputAppearance: 'plain' | 'embedded'): Story {
  return {
    args: {
      placeholder: `inputAppearance=${inputAppearance}`,
      options: defaultOptions,
      inputAppearance,
      align: inputAppearance === 'plain' ? 'right' : 'left',
      clearable: inputAppearance !== 'plain',
    },
    render: (args) => <AppearanceSelectDemo {...args} />,
  }
}

export const States: Story = {
  args: {
    placeholder: '请选择水果',
    options: defaultOptions,
    clearable: true,
  },
  render: (args) => (
    <div>
      <ControlledSelect {...args} initialValue="apple" />
    </div>
  ),
}

export const Readonly: Story = {
  args: {
    placeholder: '请选择水果',
    options: defaultOptions,
    readonly: true,
  },
  render: (args) => (
    <div>
      <ControlledSelect {...args} initialValue="banana" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: '请选择水果',
    options: defaultOptions,
    disabled: true,
  },
  render: (args) => (
    <div>
      <ControlledSelect {...args} initialValue="apple" />
    </div>
  ),
}

export const Multiple: Story = {
  args: {
    placeholder: '请选择水果（多选）',
    options: defaultOptions,
    multiple: true,
    clearable: true,
  },
  render: (args) => <MultipleSelectDemo {...args} />,
}

export const MultipleWithMaxRows: Story = {
  args: {
    placeholder: '请选择水果（多选，最大行数2）',
    options: defaultOptions,
    multiple: true,
    clearable: true,
    tagsProps: {
      maxRows: 2,
    },
  },
  render: (args) => <MultipleWithMaxRowsDemo {...args} />,
}

export const MultipleSelectAll: Story = {
  args: {
    placeholder: '请选择水果（支持全选）',
    options: defaultOptions,
    multiple: true,
    clearable: true,
    selectAll: true,
  },
  render: (args) => <MultipleSelectAllDemo {...args} />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    placeholder: '请选择城市',
    options: defaultOptions,
    clearable: true,
  },
  render: (args) => (
    <SlotStorySection slot="icon">
      <ControlledSelect
        {...args}
        initialValue=""
        className="w-[15rem]"
        iconSlot={
          <svg
            className="h-4 w-4 text-[var(--text-color-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
      />
    </SlotStorySection>
  ),
}

export const Sizes: Story = {
  args: {
    placeholder: '请选择水果',
    options: defaultOptions,
    clearable: true,
  },
  render: (args) => <SelectSizesDemo {...args} />,
}

export const AppearancePlain: Story = appearanceSelectStory('plain')

export const AppearanceEmbedded: Story = appearanceSelectStory('embedded')

const sampleOptions: CwSelectOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
]

function LegacyControlledSelect(args: Partial<ComponentProps<typeof CwSelect>>) {
  const [value, setValue] = useState<SelectValue>(args.multiple ? [] : null)
  return (
    <CwSelect
      {...args}
      options={args.options ?? sampleOptions}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

