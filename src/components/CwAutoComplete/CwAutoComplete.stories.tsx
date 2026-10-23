import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoComplete } from './CwAutoComplete'
import type { CwAutoCompleteOptionInput } from './types'

const localPool: CwAutoCompleteOptionInput[] = [
  'Apple',
  'Banana',
  'Orange',
  'Grape',
  'Watermelon',
]

const meta: Meta<typeof CwAutoComplete> = {
  title: '1. Components/Form/CwAutoComplete',
  component: CwAutoComplete,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '输入即搜的自动完成：v-model 即输入框文案；点选下拉只是把选项 label 写入输入框。选项可为字符串或 `{ label }`。',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: '占位符',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '只读',
    },
    clearable: {
      control: { type: 'boolean' },
      description: '可清空',
    },
    debounce: {
      control: { type: 'number' },
      description: '输入防抖毫秒',
    },
    options: {
      control: { type: 'object' },
      description: '备选项',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '自动完成组件尺寸',
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
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CwAutoComplete>

function ControlledAutoComplete(props: ComponentProps<typeof CwAutoComplete>) {
  const [value, setValue] = useState<string | null>(null)
  return (
    <CwAutoComplete
      {...props}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

export const LocalFilter: Story = {
  args: {
    options: localPool,
    placeholder: '输入水果名',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledAutoComplete {...args} />,
}

const fetchOptions = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return Array.from({ length: 8 }, (_, index) => `${query || 'Item'}-${index + 1}`)
}

export const RemoteMock: Story = {
  args: {
    placeholder: '远程搜索（模拟）',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledAutoComplete {...args} fetchOptions={fetchOptions} />,
}

export const RightAlign: Story = {
  args: {
    options: localPool,
    placeholder: '输入水果名（右对齐）',
    align: 'right',
    clearable: true,
  },
  render: (args) => <ControlledAutoComplete {...args} />,
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo({ args }: { args: ComponentProps<typeof CwAutoComplete> }) {
  const [values, setValues] = useState<Record<string, string | null>>({
    small: null,
    medium: null,
    large: null,
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value}>
            <div className="text-xs text-[var(--text-color-secondary)] mb-2">{item.label}</div>
            <CwAutoComplete
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
    options: localPool,
    placeholder: '输入水果名',
    clearable: true,
  },
  render: (args) => <SizesDemo args={args} />,
}

function appearanceAutoCompleteStory(
  inputAppearance: 'plain' | 'embedded',
): Story {
  return {
    args: {
      options: localPool,
      placeholder: `inputAppearance=${inputAppearance}`,
      inputAppearance,
      align: inputAppearance === 'plain' ? 'right' : 'left',
      clearable: inputAppearance !== 'plain',
    },
    render: (args) => (
      <div className="flex w-[28rem] items-center gap-3">
        <span className="w-12 shrink-0 text-sm text-[var(--text-color-secondary)]">水果</span>
        <div
          className={
            args.inputAppearance === 'plain' ? 'min-w-0 flex-1 flex justify-end' : 'min-w-0 flex-1'
          }
        >
          <ControlledAutoComplete {...args} />
        </div>
      </div>
    ),
  }
}

export const AppearancePlain: Story = appearanceAutoCompleteStory('plain')
export const AppearanceEmbedded: Story = appearanceAutoCompleteStory('embedded')
