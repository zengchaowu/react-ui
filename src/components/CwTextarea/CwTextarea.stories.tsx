import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwTextarea } from './CwTextarea'
import type { CwTextareaProps, CwTextareaTexts } from './types'

const meta: Meta<typeof CwTextarea> = {
  title: '1. Components/Form/CwTextarea',
  component: CwTextarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '支持自动高度、字符计数、最小与最大行数控制的多行文本输入组件，可用于富交互表单场景。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '当前输入值',
    },
    placeholder: {
      control: { type: 'text' },
      description: '占位提示文本',
    },
    label: {
      control: { type: 'text' },
      description: '标签文本',
    },
    showLabel: {
      control: { type: 'boolean' },
      description: '是否显示标签',
    },
    showCount: {
      control: { type: 'boolean' },
      description: '是否显示字符计数',
    },
    maxlength: {
      control: { type: 'number', min: 1, step: 1 },
      description: '字符上限',
    },
    rows: {
      control: { type: 'number', min: 1, step: 1 },
      description: '初始可见行数',
    },
    minRows: {
      control: { type: 'number', min: 1, step: 1 },
      description: '最小可见行数',
    },
    maxRows: {
      control: { type: 'number', min: 1, step: 1 },
      description: '自动调整时的最大行数',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '文本域尺寸',
    },
    texts: {
      control: false,
      table: {
        category: 'Advanced',
        type: { summary: 'Partial<CwTextareaTexts>' },
      },
      description: '自定义文案集合',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwTextarea>

function ControlledTextarea(args: CwTextareaProps & { initialValue?: string }) {
  const { initialValue = '', ...rest } = args
  const [value, setValue] = useState(initialValue)
  return <CwTextarea {...rest} value={value} onChange={setValue} />
}

function AutoHeightDemo() {
  const [value, setValue] = useState('')
  return (
    <div className="w-[30rem] space-y-2">
      <div className="text-sm text-[var(--text-color-secondary)]">
        自动高度示例：最小显示 2 行（minRows=2），最多扩展至 8 行。请尝试输入多行文字体验效果。
      </div>
      <CwTextarea
        value={value}
        onChange={setValue}
        placeholder="请输入内容"
        rows={3}
        minRows={2}
        maxRows={8}
        maxlength={400}
        showCount
      />
    </div>
  )
}

const customCounterTexts: Partial<CwTextareaTexts> = {
  label: '自定义计数',
  placeholder: '请输入自定义提示语',
  counter: '已输入 {{length}} 字 / 上限 {{maxlength}} 字',
}

function CustomCounterTextDemo() {
  const [value, setValue] = useState('可以通过 texts.counter 自定义计数模板。')
  return (
    <CwTextarea
      value={value}
      onChange={setValue}
      texts={customCounterTexts}
      showLabel
      showCount
      maxlength={280}
    />
  )
}

function SizesDemo(args: CwTextareaProps) {
  const sizes = [
    { value: 'small', label: '小号' },
    { value: 'medium', label: '中号' },
    { value: 'large', label: '大号' },
  ] as const
  const [values, setValues] = useState<Record<string, string>>({
    small: '',
    medium: '',
    large: '',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">不同尺寸（size）</div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <CwTextarea
            key={item.value}
            {...args}
            value={values[item.value]}
            onChange={(next) => setValues((prev) => ({ ...prev, [item.value]: next }))}
            size={item.value}
            placeholder={`${item.label}文本域`}
          />
        ))}
      </div>
    </div>
  )
}

export const Playground: Story = {
  args: {
    placeholder: '请输入留言内容',
    label: '留言',
    showLabel: true,
    showCount: true,
    maxlength: 200,
    rows: 4,
  },
  render: (args) => <ControlledTextarea {...args} />,
}

export const Readonly: Story = {
  args: {
    placeholder: '此处展示系统生成的信息',
    label: '客服备注',
    showLabel: true,
    readonly: true,
  },
  render: (args) => <ControlledTextarea {...args} initialValue="该字段仅供查看，无法修改。" />,
}

export const Disabled: Story = {
  args: {
    placeholder: '功能已禁用',
    label: '禁用状态',
    showLabel: true,
    disabled: true,
  },
  render: (args) => (
    <ControlledTextarea {...args} initialValue="等待管理员启用后即可编辑。" />
  ),
}

export const AutoHeight: Story = {
  render: () => <AutoHeightDemo />,
}

export const CustomCounterText: Story = {
  render: () => <CustomCounterTextDemo />,
}

export const Sizes: Story = {
  args: {
    placeholder: '请输入内容',
    rows: 3,
  },
  render: (args) => <SizesDemo {...args} />,
}
