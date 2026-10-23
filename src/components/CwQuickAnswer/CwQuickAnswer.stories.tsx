import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwQuickAnswer } from './CwQuickAnswer'

const meta: Meta<typeof CwQuickAnswer> = {
  title: '1. Components/Action/CwQuickAnswer',
  component: CwQuickAnswer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '快速答题组件，用于展示问题描述和条件列表，用户可以通过"是"或"否"按钮进行快速选择。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: '标签文本（如"肺结节"）',
    },
    description: {
      control: { type: 'text' },
      description: '问题描述',
    },
    conditions: {
      control: { type: 'object' },
      description: '条件列表',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    value: {
      control: { type: 'select' },
      options: [null, 'yes', 'no'],
      description: '当前选中的值',
    },
    texts: {
      control: { type: 'object' },
      description: '自定义文本对象',
    },
    onChange: { action: 'change' },
    onSelect: { action: 'select' },
  },
}

export default meta
type Story = StoryObj<typeof CwQuickAnswer>

const defaultConditions = [
  '最近2次胸部CT,肺结节大小、形状均无变化;',
  '肺部结节满足如下状态:肺结节直径 ≤8mm,且为全实性结节(不包含部分实性结节、磨玻璃结节,不存在分叶、毛刺、胸膜牵拉、含气细支气管征和小泡征、血管侵入,偏心厚壁空洞等恶性CT征象);',
  '医生未医嘱建议进一步病理检查或手术治疗的。',
]

const shortConditions = [
  '最近2次胸部CT,肺结节大小、形状均无变化;',
  '肺部结节满足如下状态:肺结节直径 ≤8mm,且为全实性结节;',
  '医生未医嘱建议进一步病理检查或手术治疗的。',
]

const defaultArgs = {
  label: '肺结节',
  description: '有最近一至两年的胸部CT,且同时满足如下3个条件:',
}

export const Default: Story = {
  args: {
    ...defaultArgs,
    conditions: defaultConditions,
    value: null,
  },
}

export const WithYesSelected: Story = {
  args: {
    ...defaultArgs,
    conditions: shortConditions,
    value: 'yes',
  },
}

export const WithNoSelected: Story = {
  args: {
    ...defaultArgs,
    conditions: shortConditions,
    value: 'no',
  },
}

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    conditions: shortConditions,
    disabled: true,
    value: 'yes',
  },
}

function InteractiveDemo({ initialValue = null }: { initialValue?: 'yes' | 'no' | null }) {
  const [value, setValue] = useState<'yes' | 'no' | null>(initialValue)
  return (
    <div className="w-[37.5rem]">
      <CwQuickAnswer
        label={defaultArgs.label}
        description={defaultArgs.description}
        conditions={defaultConditions}
        value={value}
        onChange={(next) => {
          setValue(next)
          console.log('Changed to:', next)
        }}
      />
      <div className="mt-4 text-sm text-[var(--text-color-placeholder)]">当前值: {value}</div>
    </div>
  )
}

export const Interactive: Story = {
  args: {
    ...defaultArgs,
    conditions: defaultConditions,
    value: null,
  },
  render: (args) => <InteractiveDemo initialValue={args.value} />,
}
