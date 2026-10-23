import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectSheet } from './CwSelectSheet'
import { CwButton } from '../CwButton'
import { showSelectSheet } from './showSelectSheet'
import type { CwSelectSheetOption, CwSelectSheetProps } from './types'

const meta: Meta<typeof CwSelectSheet> = {
  title: '1. Components/Overlay/CwSelectSheet',
  component: CwSelectSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "选择器 Sheet 的函数式 API：showSelectSheet(options) -> Promise<{ value, option } | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    options: { control: { type: 'object' }, description: '选项列表' },
    title: { control: { type: 'text' }, description: '标题' },
    disabled: { control: { type: 'boolean' }, description: '是否禁用' },
    readonly: { control: { type: 'boolean' }, description: '是否只读' },
    columns: { control: { type: 'number', min: 1, max: 6, step: 1 }, description: '列数' },
    breakpoints: { control: { type: 'object' }, description: '响应式断点配置' },
    gutter: { control: { type: 'number', min: 0, max: 32, step: 4 }, description: '栅格间隔' },
    rowGap: { control: { type: 'number', min: 0, max: 32, step: 4 }, description: '行间距' },
  },
}

export default meta
type Story = StoryObj<typeof CwSelectSheet>

const educationLevelOptions: CwSelectSheetOption[] = [
  { value: 'junior_high_below', label: '初中及以下学历' },
  { value: 'junior_high_equivalent', label: '初中及同等学历' },
  { value: 'high_school_equivalent', label: '高中及同等学历' },
  { value: 'technical_secondary', label: '中专' },
  { value: 'junior_college', label: '大专' },
  { value: 'bachelor', label: '本科' },
  { value: 'postgraduate', label: '研究生' },
  { value: 'master', label: '硕士' },
  { value: 'doctorate', label: '博士' },
  { value: 'other', label: '其他' },
]

interface SelectSheetDemoProps {
  options?: CwSelectSheetOption[]
  title?: string
  disabled?: boolean
  readonly?: boolean
  columns?: number
  breakpoints?: CwSelectSheetProps['breakpoints']
  gutter?: number
  rowGap?: number
  buttonText?: string
  initialValue?: string | number | null
  initialLabel?: string
  hint?: string
}

function SelectSheetDemo({
  options,
  title,
  disabled = false,
  readonly = false,
  columns,
  breakpoints,
  gutter,
  rowGap,
  buttonText = '打开选择器',
  initialValue = null,
  initialLabel = '未选择',
  hint,
}: SelectSheetDemoProps) {
  const [selectedValue, setSelectedValue] = useState<string | number | null>(initialValue)
  const [selectedLabel, setSelectedLabel] = useState<string>(initialLabel)

  const handleShow = async () => {
    if (disabled) return
    const result = await showSelectSheet({
      title,
      options,
      columns,
      breakpoints,
      gutter,
      rowGap,
      disabled,
      readonly,
      value: selectedValue,
    })
    if (result !== 'cancel') {
      setSelectedValue(result.value)
      setSelectedLabel(result.option?.label || '未选择')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <CwButton type="primary" disabled={disabled} onClick={() => void handleShow()}>
        {buttonText}
      </CwButton>
      <div className="text-sm text-[var(--text-color-secondary)]">当前选择：{selectedLabel}</div>
      {hint ? (
        <div className="text-xs text-[var(--text-color-placeholder)] text-center">{hint}</div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度',
    disabled: false,
    readonly: false,
    columns: 3,
  },
  render: (args) => (
    <SelectSheetDemo options={args.options} title={args.title} disabled={args.disabled} readonly={args.readonly} columns={args.columns} />
  ),
}

export const TwoColumns: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度',
    disabled: false,
    readonly: false,
    columns: 2,
  },
  render: (args) => (
    <SelectSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      columns={2}
      buttonText="打开选择器（2列）"
    />
  ),
}

export const WithDisabledOption: Story = {
  args: {
    options: [],
    title: '文化程度',
    disabled: false,
    readonly: false,
    columns: 3,
  },
  render: (args) => (
    <SelectSheetDemo
      options={[
        ...educationLevelOptions,
        { value: 'disabled_option', label: '禁用选项', disabled: true },
      ]}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      columns={args.columns}
      buttonText="打开选择器（含禁用选项）"
    />
  ),
}

export const Disabled: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度',
    disabled: true,
    readonly: false,
    columns: 3,
  },
  render: (args) => (
    <SelectSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      columns={args.columns}
      buttonText="打开选择器（已禁用）"
      hint="注意：当 disabled 为 true 时，选择器无法打开"
    />
  ),
}

export const Readonly: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度',
    disabled: false,
    readonly: true,
    columns: 3,
  },
  render: (args) => (
    <SelectSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled || args.readonly}
      readonly={args.readonly}
      columns={args.columns}
      initialValue="bachelor"
      initialLabel="本科"
      buttonText="打开选择器（只读）"
      hint="注意：当 readonly 为 true 时，选择器无法打开"
    />
  ),
}

export const Responsive: Story = {
  args: {
    options: educationLevelOptions,
    title: '文化程度（响应式）',
    disabled: false,
    readonly: false,
    columns: 3,
    gutter: 12,
    rowGap: 12,
    breakpoints: {
      xs: { columns: 1 },
      sm: { columns: 2 },
      md: { columns: 3 },
      lg: { columns: 4 },
      xl: { columns: 5 },
    },
  },
  render: (args) => (
    <SelectSheetDemo
      options={args.options}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
      columns={args.columns}
      breakpoints={args.breakpoints}
      gutter={args.gutter}
      rowGap={args.rowGap}
      buttonText="打开响应式选择器"
      hint="响应式配置：xs=1列，sm=2列，md=3列，lg=4列，xl=5列（支持任意列数）"
    />
  ),
}
