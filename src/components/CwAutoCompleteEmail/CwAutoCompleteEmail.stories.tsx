import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoCompleteEmail } from './CwAutoCompleteEmail'

const meta: Meta<typeof CwAutoCompleteEmail> = {
  title: '1. Components/Form/CwAutoCompleteEmail',
  component: CwAutoCompleteEmail,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '邮箱自动补全组件，基于 CwAutoComplete，自动识别邮箱前缀和后缀，提供邮箱后缀自动补全功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    clearable: {
      control: { type: 'boolean' },
    },
    debounce: {
      control: { type: 'number' },
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '邮箱自动完成组件尺寸',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwAutoCompleteEmail>

function ControlledEmail({
  initialValue = null,
  ...props
}: ComponentProps<typeof CwAutoCompleteEmail> & { initialValue?: string | null }) {
  const [value, setValue] = useState<string | null>(initialValue)
  return (
    <CwAutoCompleteEmail
      {...props}
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
    />
  )
}

export const Default: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledEmail {...args} />,
}

export const WithInitialValue: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    clearable: true,
  },
  render: (args) => <ControlledEmail {...args} initialValue="example@gmail.com" />,
}

export const Disabled: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    disabled: true,
  },
  render: (args) => <ControlledEmail {...args} initialValue="example@gmail.com" />,
}

export const Readonly: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    readonly: true,
  },
  render: (args) => <ControlledEmail {...args} initialValue="example@gmail.com" />,
}

export const CustomSuffixes: Story = {
  args: {
    placeholder: '请输入邮箱地址',
    clearable: true,
    emailSuffixes: ['@example.com', '@test.com', '@demo.com'],
  },
  render: (args) => <ControlledEmail {...args} />,
}

export const RightAlign: Story = {
  args: {
    placeholder: '请输入邮箱地址（右对齐）',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <ControlledEmail {...args} align="right" />,
}

const sizes = [
  { value: 'small', label: '小号' },
  { value: 'medium', label: '中号' },
  { value: 'large', label: '大号' },
] as const

function SizesDemo({ args }: { args: ComponentProps<typeof CwAutoCompleteEmail> }) {
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
            <CwAutoCompleteEmail
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
    placeholder: '请输入邮箱地址',
    clearable: true,
    debounce: 150,
  },
  render: (args) => <SizesDemo args={args} />,
}
