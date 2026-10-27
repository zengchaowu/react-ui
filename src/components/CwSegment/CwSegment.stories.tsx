import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSegment } from './CwSegment'
import type { CwSegmentProps } from './types'

const options = [
  { label: '短信登录', value: 'sms' },
  { label: '密码登录', value: 'password' },
]

const meta: Meta<typeof CwSegment> = {
  title: '1. Components/Navigation/CwSegment',
  component: CwSegment,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '分段控制器，用于在多个选项之间切换。基于 Figma 设计，胶囊形外观，选中项浅灰背景、未选中项透明背景。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '当前选中值',
    },
    options: {
      description:
        '选项列表，支持字符串数组或 CwSegmentOption 对象数组；对象可传 icon 显示图标，无 label 时为纯图标模式',
    },
    disabled: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '尺寸',
    },
    onChange: { action: 'change' },
  },
  args: {
    options,
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ControlledSegment(props: Partial<CwSegmentProps> & { initialValue?: string | number }) {
  const { initialValue = 'sms', options: optionsProp, ...rest } = props
  const [value, setValue] = useState<string | number>(initialValue)
  return (
    <CwSegment {...rest} options={optionsProp ?? options} value={value} onChange={setValue} />
  )
}

export const Default: Story = {
  args: {
    options,
  },
  render: (args) => <ControlledSegment {...args} />,
}

export const Sizes: Story = {
  args: {
    options,
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <ControlledSegment key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    options,
    disabled: true,
  },
  render: (args) => <ControlledSegment {...args} />,
}

export const StringOptions: Story = {
  args: {
    options: ['选项 A', '选项 B', '选项 C'],
  },
  render: (args) => <ControlledSegment {...args} initialValue="选项 A" />,
}

const iconOnlyOptions = [
  {
    value: 'grid',
    icon: 'common--commerce--card-view-line',
    title: '网栅视图',
  },
  {
    value: 'list',
    icon: 'common--commerce--list-view-line',
    title: '列表视图',
  },
]

const iconLabelOptions = iconOnlyOptions.map((option) => ({
  ...option,
  label: option.title,
}))

export const IconOnly: Story = {
  args: {
    options: iconOnlyOptions,
    size: 'small',
  },
  render: (args) => <ControlledSegment {...args} initialValue="grid" />,
}

export const IconWithLabel: Story = {
  args: {
    options: iconLabelOptions,
  },
  render: (args) => <ControlledSegment {...args} initialValue="grid" />,
}
