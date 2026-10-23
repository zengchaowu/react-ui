import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCellForm } from './CwCellForm'
import { CwInput } from '../CwInput'
import { CwSelect } from '../CwSelect'
import { CwButton } from '../CwButton'
import type { CwCellFormItemConfig } from './types'

const meta: Meta<typeof CwCellForm> = {
  title: '1. Components/Form/CwCellForm',
  component: CwCellForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'CwCellForm：`CwCard` 壳 + `CwCell`（appearance=form）行。通过 `items` 配置字段，支持右侧操作。不是 `CwCard + CwForm`（栅格校验表单请用 CwForm）。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: '卡片标题',
    },
    items: {
      control: false,
      description: '表单项配置数组',
    },
    value: {
      control: false,
      description: '表单数据',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用整个表单',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    itemContentInnerClass: {
      control: { type: 'text' },
      description: '右侧表单项内层追加 class',
    },
  },
  args: {
    title: '基本信息',
    items: [],
    value: {},
    disabled: false,
    readonly: false,
    itemContentInnerClass: '',
  },
}

export default meta
type Story = StoryObj<typeof CwCellForm>

function inputItem(
  prop: string,
  label: string,
  overrides: Partial<CwCellFormItemConfig> = {},
): CwCellFormItemConfig {
  return {
    prop,
    label,
    required: false,
    componentConfig: {
      component: CwInput,
      defaultProps: {
        placeholder: `请输入${label}`,
      },
    },
    props: {},
    showDivider: true,
    ...overrides,
  }
}

function selectItem(
  prop: string,
  label: string,
  options: Array<{ label: string; value: string | number }>,
  overrides: Partial<CwCellFormItemConfig> = {},
): CwCellFormItemConfig {
  return {
    prop,
    label,
    required: false,
    componentConfig: {
      component: CwSelect,
      defaultProps: {
        placeholder: `请选择${label}`,
        options,
      },
    },
    props: {},
    showDivider: true,
    ...overrides,
  }
}

const basicItems: CwCellFormItemConfig[] = [
  inputItem('name', '姓名', { required: true }),
  inputItem('email', '邮箱', { required: true }),
  inputItem('phone', '手机号', { required: true, showDivider: false }),
]

function JsonPreview({ value }: { value: Record<string, unknown> }) {
  return (
    <pre className="mt-4 p-4 bg-[var(--bg-color-component)] rounded text-xs overflow-auto">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

function CellFormDemo({ initialValue }: { initialValue?: Record<string, unknown> }) {
  const [value, setValue] = useState<Record<string, unknown>>(initialValue ?? {})
  return (
    <div className="max-w-md">
      <CwCellForm
        title="基本信息"
        items={basicItems}
        value={value}
        onChange={(next) => setValue(next)}
      />
      <JsonPreview value={value} />
    </div>
  )
}

export const Default: Story = {
  render: () => <CellFormDemo initialValue={{ name: '', email: '', phone: '' }} />,
}

function CodeButton() {
  return (
    <CwButton type="primary" variant="text" size="small">
      获取验证码
    </CwButton>
  )
}

const selectItems = [
  selectItem(
    'type',
    '投保人类型',
    [
      { label: '个人', value: 'individual' },
      { label: '企业', value: 'company' },
    ],
    { required: true },
  ),
  selectItem(
    'idType',
    '证件类型',
    [
      { label: '身份证', value: 'id' },
      { label: '护照', value: 'passport' },
    ],
    { required: true },
  ),
  inputItem('idNumber', '证件号码', { required: true, showDivider: false }),
]

function WithSelectDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    type: null,
    idType: null,
    idNumber: '',
  })
  return (
    <div className="max-w-md">
      <CwCellForm
        value={form}
        items={selectItems}
        title="投保人信息"
        onChange={(next) => setForm(next)}
      />
      <JsonPreview value={form} />
    </div>
  )
}

export const WithSelect: Story = {
  render: () => <WithSelectDemo />,
}

function WithRightActionDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    phone: '',
    code: '',
  })
  const items: CwCellFormItemConfig[] = [
    inputItem('phone', '手机号码', { required: true }),
    {
      ...inputItem('code', '验证码', { required: true, showDivider: false }),
      rightAction: CodeButton,
    },
  ]
  return (
    <div className="max-w-md">
      <CwCellForm
        value={form}
        items={items}
        title="验证信息"
        onChange={(next) => setForm(next)}
      />
      <JsonPreview value={form} />
    </div>
  )
}

export const WithRightAction: Story = {
  render: () => <WithRightActionDemo />,
}

function FullExampleDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    type: null,
    name: '',
    idType: null,
    idNumber: '',
    idValidFrom: '',
    idValidUntil: '',
    phone: '',
    email: '',
    address: '',
    detailAddress: '',
    code: '',
  })
  const items: CwCellFormItemConfig[] = [
    selectItem('type', '投保人类型', [
      { label: '个人', value: 'individual' },
      { label: '企业', value: 'company' },
    ]),
    inputItem('name', '姓名', { required: true }),
    selectItem(
      'idType',
      '证件类型',
      [
        { label: '身份证', value: 'id' },
        { label: '护照', value: 'passport' },
      ],
      { required: true },
    ),
    inputItem('idNumber', '证件号码', { required: true }),
    inputItem('idValidFrom', '证件有效起期'),
    inputItem('idValidUntil', '证件有效止期'),
    inputItem('phone', '手机号码', { required: true }),
    inputItem('email', '电子邮箱', { required: true }),
    inputItem('address', '投保人地址'),
    inputItem('detailAddress', '详细地址'),
    {
      ...inputItem('code', '验证码', { showDivider: false }),
      rightAction: CodeButton,
    },
  ]
  return (
    <div className="max-w-md">
      <CwCellForm
        value={form}
        items={items}
        title="投保人信息"
        onChange={(next) => setForm(next)}
      />
      <JsonPreview value={form} />
    </div>
  )
}

export const FullExample: Story = {
  render: () => <FullExampleDemo />,
}

export const Disabled: Story = {
  render: () => (
    <div className="max-w-md">
      <CwCellForm
        title="基本信息"
        items={basicItems}
        value={{ name: '张三', email: 'zhangsan@example.com', phone: '13800138000' }}
        disabled
      />
    </div>
  ),
}

const fixedRightWidthItems = [
  selectItem(
    'type',
    '投保人类型',
    [
      { label: '个人', value: 'individual' },
      { label: '企业', value: 'company' },
    ],
    { required: true },
  ),
  inputItem('name', '姓名', { required: true }),
  selectItem(
    'idType',
    '证件类型',
    [
      { label: '身份证', value: 'id' },
      { label: '护照', value: 'passport' },
    ],
    { required: true },
  ),
  inputItem('idNumber', '证件号码', { required: true }),
  inputItem('phone', '手机号码', { required: true }),
  inputItem('email', '电子邮箱', { required: true, showDivider: false }),
]

function WithFixedRightWidthDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    type: null,
    name: '',
    idType: null,
    idNumber: '',
    phone: '',
    email: '',
  })
  return (
    <div className="max-w-md">
      <CwCellForm
        value={form}
        items={fixedRightWidthItems}
        title="固定右侧宽度示例"
        itemContentInnerClass="flex items-center gap-2 justify-end w-[14rem] min-w-0"
        onChange={(next) => setForm(next)}
      />
      <JsonPreview value={form} />
    </div>
  )
}

export const WithFixedRightWidth: Story = {
  render: () => <WithFixedRightWidthDemo />,
}

export const Readonly: Story = {
  render: () => (
    <div className="max-w-md">
      <CwCellForm
        title="基本信息"
        items={basicItems}
        value={{ name: '李四', email: 'lisi@example.com', phone: '13900139000' }}
        readonly
      />
    </div>
  ),
}
