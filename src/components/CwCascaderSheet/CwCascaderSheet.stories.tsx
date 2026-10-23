import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton'
import { CwCascaderSheet } from './CwCascaderSheet'
import { showCascaderSheet } from './showCascaderSheet'
import type { CwCascaderSheetOption } from './types'

const meta: Meta<typeof CwCascaderSheet> = {
  title: '1. Components/Overlay/CwCascaderSheet',
  component: CwCascaderSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "级联选择器 Sheet 的函数式 API：showCascaderSheet(options) -> Promise<{ value, option } | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    options: { control: { type: 'object' }, description: '级联数据' },
    title: { control: { type: 'text' }, description: '标题' },
    disabled: { control: { type: 'boolean' }, description: '是否禁用' },
    readonly: { control: { type: 'boolean' }, description: '是否只读' },
  },
}

export default meta
type Story = StoryObj<typeof CwCascaderSheet>

const regionOptions: CwCascaderSheetOption[] = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      {
        label: '东城区',
        value: 'dongcheng',
        children: [
          { label: '东华门街道', value: 'donghuamen' },
          { label: '景山街道', value: 'jingshan' },
          { label: '交道口街道', value: 'jiaodaokou' },
        ],
      },
      {
        label: '西城区',
        value: 'xicheng',
        children: [
          { label: '西长安街街道', value: 'xichanganjie' },
          { label: '新街口街道', value: 'xinjiekou' },
          { label: '月坛街道', value: 'yuetan' },
        ],
      },
      {
        label: '朝阳区',
        value: 'chaoyang',
        children: [
          { label: '建外街道', value: 'jianwai' },
          { label: '朝外街道', value: 'chaowai' },
          { label: '呼家楼街道', value: 'hujialou' },
        ],
      },
    ],
  },
  {
    label: '上海市',
    value: 'shanghai',
    children: [
      {
        label: '黄浦区',
        value: 'huangpu',
        children: [
          { label: '南京东路街道', value: 'nanjingdonglu' },
          { label: '外滩街道', value: 'waitan' },
          { label: '半淞园路街道', value: 'bansongyuanlu' },
        ],
      },
      {
        label: '徐汇区',
        value: 'xuhui',
        children: [
          { label: '湖南路街道', value: 'hunanlu' },
          { label: '天平路街道', value: 'tianpinglu' },
          { label: '枫林路街道', value: 'fenglinlu' },
        ],
      },
    ],
  },
  {
    label: '广东省',
    value: 'guangdong',
    children: [
      {
        label: '广州市',
        value: 'guangzhou',
        children: [
          { label: '越秀区', value: 'yuexiu' },
          { label: '海珠区', value: 'haizhu' },
          { label: '天河区', value: 'tianhe' },
        ],
      },
      {
        label: '深圳市',
        value: 'shenzhen',
        children: [
          { label: '罗湖区', value: 'luohu' },
          { label: '福田区', value: 'futian' },
          { label: '南山区', value: 'nanshan' },
        ],
      },
    ],
  },
]

interface CascaderSheetDemoProps {
  options?: CwCascaderSheetOption[]
  title?: string
  disabled?: boolean
  readonly?: boolean
  buttonText?: string
  initialValue?: unknown[]
  initialLabel?: string
  showPath?: boolean
  hint?: string
}

function CascaderSheetDemo({
  options,
  title,
  disabled = false,
  readonly = false,
  buttonText = '打开级联选择器',
  initialValue = [],
  initialLabel = '未选择',
  showPath = false,
  hint,
}: CascaderSheetDemoProps) {
  const [selectedValue, setSelectedValue] = useState<unknown[]>(initialValue)
  const [selectedLabel, setSelectedLabel] = useState<string>(initialLabel)

  const handleShow = async () => {
    if (disabled) return
    const result = await showCascaderSheet({
      title,
      options,
      disabled,
      readonly,
      value: selectedValue,
    })
    if (result !== 'cancel') {
      setSelectedValue(result.value)
      setSelectedLabel(result.option ? result.option.label : '未选择')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <CwButton type="primary" disabled={disabled} onClick={() => void handleShow()}>
        {buttonText}
      </CwButton>
      <div className="text-sm text-[var(--text-color-secondary)]">当前选择：{selectedLabel}</div>
      {showPath && selectedValue.length > 0 ? (
        <div className="text-xs text-[var(--text-color-secondary)]">
          路径值：{selectedValue.join(' / ')}
        </div>
      ) : null}
      {hint ? (
        <div className="text-xs text-[var(--text-color-secondary)]">{hint}</div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: {
    options: regionOptions,
    title: '选择地区',
    disabled: false,
    readonly: false,
  },
  render: (args) => (
    <CascaderSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      showPath
    />
  ),
}

export const WithInitialValue: Story = {
  args: {
    options: regionOptions,
    title: '选择地区',
    disabled: false,
    readonly: false,
  },
  render: (args) => (
    <CascaderSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      buttonText="打开级联选择器（有初始值）"
      initialValue={['beijing', 'dongcheng', 'donghuamen']}
      initialLabel="北京市 / 东城区 / 东华门街道"
    />
  ),
}

const optionsWithDisabled: CwCascaderSheetOption[] = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      {
        label: '东城区',
        value: 'dongcheng',
        disabled: true,
        children: [
          { label: '东华门街道', value: 'donghuamen' },
          { label: '景山街道', value: 'jingshan' },
        ],
      },
      {
        label: '西城区',
        value: 'xicheng',
        children: [
          { label: '西长安街街道', value: 'xichanganjie' },
          { label: '新街口街道', value: 'xinjiekou', disabled: true },
        ],
      },
    ],
  },
]

export const WithDisabledOption: Story = {
  args: {
    options: [],
    title: '选择地区',
    disabled: false,
    readonly: false,
  },
  render: (args) => (
    <CascaderSheetDemo
      options={optionsWithDisabled}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      buttonText="打开级联选择器（含禁用选项）"
    />
  ),
}

export const Disabled: Story = {
  args: {
    options: regionOptions,
    title: '选择地区',
    disabled: true,
    readonly: false,
  },
  render: (args) => (
    <div className="p-4">
      <CascaderSheetDemo
        options={args.options}
        title={args.title}
        disabled={args.disabled}
        readonly={args.readonly}
        buttonText="打开级联选择器（已禁用）"
      />
    </div>
  ),
}

export const Readonly: Story = {
  args: {
    options: regionOptions,
    title: '选择地区',
    disabled: false,
    readonly: true,
  },
  render: (args) => (
    <CascaderSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      buttonText="打开级联选择器（只读）"
      initialValue={['beijing', 'dongcheng', 'donghuamen']}
      hint="只读模式下可以查看但不能修改选择"
    />
  ),
}
