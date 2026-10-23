import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSearchBar } from './CwSearchBar'
import type { CwSearchBarProps } from './types'

const meta: Meta<typeof CwSearchBar> = {
  title: '1. Components/Form/CwSearchBar',
  component: CwSearchBar,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: '输入框的值',
    },
    placeholder: {
      control: 'text',
      description: '输入框占位符',
    },
    buttonText: {
      control: 'text',
      description: '查询按钮文本',
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用',
    },
    readonly: {
      control: 'boolean',
      description: '是否只读',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '输入框尺寸',
    },
    onSearch: {
      action: 'search',
      description: '查询按钮点击事件',
    },
  },
  args: {
    placeholder: '请输入客户名称',
    buttonText: '查询',
  },
}

export default meta
type Story = StoryObj<typeof CwSearchBar>

function SearchBarDemo({
  initialValue = '',
  showValue = false,
  ...props
}: CwSearchBarProps & { initialValue?: string; showValue?: boolean }) {
  const [value, setValue] = useState(initialValue)
  return (
    <div className="p-4">
      <CwSearchBar {...props} value={value} onChange={setValue} />
      {showValue ? (
        <div className="mt-4 text-sm text-[var(--text-color-placeholder)]">当前值: {value}</div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  render: (args) => <SearchBarDemo {...args} showValue />,
}

export const WithValue: Story = {
  render: (args) => <SearchBarDemo {...args} initialValue="张三" />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <SearchBarDemo {...args} />,
}

export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => <SearchBarDemo {...args} initialValue="只读状态" />,
}

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const

function SizesDemo(args: CwSearchBarProps) {
  const [values, setValues] = useState<Record<string, string>>({
    small: '',
    medium: '',
    large: '',
  })
  return (
    <div className="p-4 space-y-4">
      {sizes.map((item) => (
        <div key={item.value}>
          <div className="mb-2 text-sm text-[var(--text-color-placeholder)]">{item.label}</div>
          <CwSearchBar
            {...args}
            size={item.value}
            value={values[item.value]}
            onChange={(next) => setValues((prev) => ({ ...prev, [item.value]: next }))}
          />
        </div>
      ))}
    </div>
  )
}

export const Sizes: Story = {
  render: (args) => <SizesDemo {...args} />,
}

function InteractiveDemo(args: CwSearchBarProps) {
  const [value, setValue] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  return (
    <div className="p-4">
      <CwSearchBar
        {...args}
        value={value}
        onChange={setValue}
        onSearch={(searchValue) => {
          setSearchResults((prev) => [...prev, `搜索: ${searchValue || '(空)'}`])
          args.onSearch?.(searchValue)
        }}
      />
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">搜索历史:</div>
        {searchResults.length === 0 ? (
          <div className="text-sm text-[var(--text-color-placeholder)]">暂无搜索记录</div>
        ) : (
          <ul className="space-y-1">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="text-sm text-[var(--text-color-secondary)]"
              >
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const Interactive: Story = {
  render: (args) => <InteractiveDemo {...args} />,
}
