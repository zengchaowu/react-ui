import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwForm } from './CwForm'
import type { CwFormConfig, CwFormItemConfigInForm, CwFormProps } from './types'
import { CwInput } from '../CwInput'
import { CwSwitch } from '../CwSwitch'
import { CwSlider } from '../CwSlider'
import { CwButton } from '../CwButton'
import { CwSelect } from '../CwSelect'
import { CwAutoComplete } from '../CwAutoComplete'
import { CwCascader } from '../CwCascader'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwForm> = {
  title: '1. Components/Form/CwForm',
  component: CwForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'CwForm 提供响应式布局与统一校验的表单容器，通过 `config.items` 配置每个字段，内部使用 `CwFormItem` 动态渲染控件并处理校验/禁用/只读等状态。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    config: { control: false, description: '表单配置' },
    value: { control: false, description: '表单数据' },
    disabled: { control: { type: 'boolean' }, description: '是否禁用整个表单' },
    readonly: { control: { type: 'boolean' }, description: '是否只读' },
    texts: { control: false },
  },
  args: {
    disabled: false,
    readonly: false,
  },
}

export default meta
type Story = StoryObj<typeof CwForm>

function inputItem(
  prop: string,
  label: string,
  overrides: Partial<CwFormItemConfigInForm> = {},
): CwFormItemConfigInForm {
  return {
    prop,
    label,
    required: false,
    componentConfig: {
      component: CwInput,
      defaultProps: {
        placeholder: `请输入${label}`,
        clearable: true,
      },
    },
    props: {},
    ...overrides,
  }
}

function baseConfig(
  items: CwFormItemConfigInForm[],
  overrides: Partial<CwFormConfig> = {},
): CwFormConfig {
  return {
    items,
    item: { col: { xs: 12, sm: 12, md: 8 } },
    layout: {
      maxRows: 999,
      grid: { gutter: 12, rowGap: 12 },
    },
    ...overrides,
  }
}

const twoFieldConfig = baseConfig([inputItem('name', '姓名'), inputItem('email', '邮箱')])

type FormArgs = Omit<Partial<CwFormProps>, 'value' | 'config'>

function DefaultFormDemo(args: FormArgs) {
  const [form, setForm] = useState<Record<string, unknown>>({ name: '', email: '' })
  return (
    <div>
      <CwForm {...args} config={twoFieldConfig} value={form} onChange={setForm} />
    </div>
  )
}

function DisabledReadonlyDemo() {
  const [form1, setForm1] = useState<Record<string, unknown>>({
    a: '禁用表单',
    b: '不可编辑',
  })
  const [form2, setForm2] = useState<Record<string, unknown>>({
    a: '只读表单',
    b: '可聚焦但不改值',
  })
  const config = baseConfig([inputItem('a', '字段A'), inputItem('b', '字段B')])
  return (
    <div>
      <div>
        <CwForm config={config} value={form1} onChange={setForm1} disabled />
      </div>
      <div>
        <CwForm config={config} value={form2} onChange={setForm2} readonly />
      </div>
    </div>
  )
}

function WithSlotsDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    f1: '',
    f2: '',
    f3: '',
    f4: '',
    f5: '',
  })
  const [maxRows, setMaxRows] = useState(1)
  const items = [
    inputItem('f1', '字段1'),
    inputItem('f2', '字段2'),
    inputItem('f3', '字段3'),
    inputItem('f4', '字段4'),
    inputItem('f5', '字段5'),
  ]
  const config: CwFormConfig = {
    items,
    item: { col: { xs: 12, sm: 12, md: 6 } },
    layout: { maxRows, grid: { gutter: 12, rowGap: 12 } },
  }
  const toggleRows = () => {
    setMaxRows(maxRows === 1 ? 999 : 1)
  }
  return (
    <div className="max-w-2xl">
      <SlotStorySection slot="collapse-controls">
        <CwForm
          config={config}
          value={form}
          onChange={setForm}
          collapseControlsSlot={
            <div className="flex h-full w-full items-center justify-end">
              <CwButton variant="text" onClick={toggleRows}>
                {maxRows === 1 ? '展开更多' : '收起'}
              </CwButton>
            </div>
          }
        />
      </SlotStorySection>
    </div>
  )
}

function LayoutAndMaxRowsDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    f1: '',
    f2: '',
    f3: '',
    f4: '',
    f5: '',
  })
  const [maxRows, setMaxRows] = useState(1)
  const items = [
    inputItem('f1', '字段1'),
    inputItem('f2', '字段2'),
    inputItem('f3', '字段3'),
    inputItem('f4', '字段4'),
    inputItem('f5', '字段5'),
  ]
  const config: CwFormConfig = {
    items,
    item: { col: { xs: 12, sm: 12, md: 6 } },
    layout: { maxRows, grid: { gutter: 12, rowGap: 12 } },
  }
  const toggleRows = () => {
    setMaxRows(maxRows === 1 ? 999 : 1)
  }
  return (
    <div>
      <CwForm
        config={config}
        value={form}
        onChange={setForm}
        collapseControlsSlot={
          <div className="flex h-full w-full items-center justify-end">
            <CwButton variant="text" onClick={toggleRows}>
              {maxRows === 1 ? '展开更多' : '收起'}
            </CwButton>
          </div>
        }
      />
    </div>
  )
}

function LabelOnLeftItemsDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    email: '',
    company: '',
  })
  const items: CwFormItemConfigInForm[] = [
    inputItem('name', '姓名', {
      labelWidth: '60px',
      appearance: 'filter-row',
    }),
    inputItem('email', '邮箱', {
      labelWidth: '60px',
      appearance: 'filter-row',
    }),
    inputItem('company', '公司', {
      required: true,
      labelWidth: (cfg) => (cfg.required ? '60px' : '60px'),
      appearance: 'filter-row',
    }),
  ]
  const config = baseConfig(items, {
    item: { col: { xs: 12, sm: 12, md: 12 }, appearance: 'filter-row' },
    layout: { maxRows: 999, grid: { gutter: 12, rowGap: 12 } },
  })
  return (
    <div>
      <CwForm config={config} value={form} onChange={setForm} />
    </div>
  )
}

/** 管理端列表筛选：filter-row + 查询/重置（#collapse-controls 写法与 ConfigDrivenListPage 一致） */
function FilterRowWithActionsDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({ keyword: '' })
  const [pending, setPending] = useState(false)
  const config: CwFormConfig = {
    items: [
      inputItem('keyword', '关键字', {
        labelWidth: '80px',
        appearance: 'filter-row',
        componentConfig: {
          component: CwInput,
          defaultProps: {
            placeholder: '端点组 / 模型名称或 ID',
            clearable: true,
          },
        },
      }),
    ],
    item: {
      appearance: 'filter-row',
      // 与 admin ADMIN_LIST_FILTER_COL_PROPS 一致：宽屏最多 4 列
      col: { xs: 24, sm: 12, md: 8, lg: 6 },
    },
    layout: { maxRows: 2, grid: { gutter: 12, rowGap: 12 }, native: true },
  }
  const onSearch = () => {
    setPending(true)
    window.setTimeout(() => {
      setPending(false)
    }, 400)
  }
  const onReset = () => {
    setForm({ keyword: '' })
    onSearch()
  }
  return (
    <div className="rounded border border-[var(--border-color)] bg-[var(--bg-color-container)] p-4">
      <CwForm
        config={config}
        value={form}
        onChange={setForm}
        onSubmit={onSearch}
        collapseControlsSlot={
          <div className="flex h-full w-full items-center justify-end gap-3">
            <CwButton type="default" size="medium" disabled={pending} onClick={onReset}>
              重置
            </CwButton>
            <CwButton type="primary" size="medium" loading={pending} onClick={onSearch}>
              查询
            </CwButton>
          </div>
        }
      />
    </div>
  )
}

// 复杂布局与折叠演示：动态切换 maxRows、混合左右标签与不同列宽
function AdvancedLayoutAndCollapseDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    address: '',
    city: '',
    zip: '',
  })
  const [maxRows, setMaxRows] = useState(1)

  const items: CwFormItemConfigInForm[] = [
    inputItem('name', '姓名', { required: true, labelWidth: '100px', appearance: 'filter-row' }),
    inputItem('email', '邮箱', { required: true, labelWidth: '80px', appearance: 'filter-row' }),
    inputItem('phone', '电话', { labelWidth: '80px', appearance: 'filter-row' }),
    inputItem('company', '公司', {
      required: true,
      labelWidth: '80px',
      appearance: 'filter-row',
    }),
    inputItem('title', '职位', { labelWidth: '120px', appearance: 'filter-row' }),
    inputItem('address', '地址', { labelWidth: '120px', appearance: 'filter-row' }),
    inputItem('city', '城市', { labelWidth: '120px', appearance: 'filter-row' }),
    inputItem('zip', '邮编', { labelWidth: '120px', appearance: 'filter-row' }),
  ]

  const config: CwFormConfig = {
    items,
    item: { col: { xs: 12, sm: 12, md: 6 }, appearance: 'filter-row' },
    layout: { maxRows, grid: { gutter: 12, rowGap: 12 } },
  }

  const toggleRows = () => {
    setMaxRows(maxRows === 1 ? 999 : 1)
  }

  return (
    <div>
      <CwForm
        config={config}
        value={form}
        onChange={setForm}
        collapseControlsSlot={
          <div className="flex h-full w-full items-center justify-end">
            <CwButton variant="text" onClick={toggleRows}>
              {maxRows === 1 ? '展开更多' : '收起'}
            </CwButton>
          </div>
        }
      />
    </div>
  )
}

// 跨字段校验演示：密码与确认密码一致，否则展示错误
function CrossFieldValidationDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({ password: '', confirm: '' })
  const items: CwFormItemConfigInForm[] = [
    inputItem('password', '密码', { required: true }),
    {
      ...inputItem('confirm', '确认密码', { required: true }),
      validate: (data) => {
        const ok = Boolean(data.confirm) && data.password === data.confirm
        return { valid: Boolean(ok), message: ok ? '' : '两次输入不一致' }
      },
    },
  ]
  const config = baseConfig(items)
  return (
    <div>
      <CwForm config={config} value={form} onChange={setForm} />
    </div>
  )
}

// 综合示例：展示各种不同类型的组件
function ComprehensiveExampleDemo() {
  const [form, setForm] = useState<Record<string, unknown>>({
    text: '文本输入',
    select: '选项1',
    switch: true,
    slider: 50,
    autocomplete: '',
    cascader: [],
  })

  const items: CwFormItemConfigInForm[] = [
    inputItem('text', '文本输入', {
      componentConfig: {
        component: CwInput,
        defaultProps: {
          placeholder: '请输入文本',
          clearable: true,
        },
      },
    }),
    {
      prop: 'select',
      label: '下拉选择',
      required: false,
      componentConfig: {
        component: CwSelect,
        defaultProps: {
          placeholder: '请选择',
          options: [
            { label: '选项1', value: '选项1' },
            { label: '选项2', value: '选项2' },
            { label: '选项3', value: '选项3' },
          ],
          clearable: true,
        },
      },
      props: {},
    },
    {
      prop: 'switch',
      label: '开关',
      required: false,
      componentConfig: {
        component: CwSwitch,
        defaultProps: {},
      },
      props: {},
    },
    {
      prop: 'slider',
      label: '滑块',
      required: false,
      componentConfig: {
        component: CwSlider,
        defaultProps: {
          min: 0,
          max: 100,
          step: 1,
        },
      },
      props: {},
    },
    {
      prop: 'autocomplete',
      label: '自动完成',
      required: false,
      componentConfig: {
        component: CwAutoComplete,
        defaultProps: {
          placeholder: '请输入并选择',
          options: ['北京', '上海', '广州', '深圳'],
          clearable: true,
        },
      },
      props: {},
    },
    {
      prop: 'cascader',
      label: '级联选择',
      required: false,
      componentConfig: {
        component: CwCascader,
        defaultProps: {
          placeholder: '请选择',
          options: [
            {
              label: '华东',
              value: '华东',
              children: [
                { label: '上海', value: '上海' },
                { label: '江苏', value: '江苏' },
                { label: '浙江', value: '浙江' },
              ],
            },
            {
              label: '华南',
              value: '华南',
              children: [
                { label: '广东', value: '广东' },
                { label: '广西', value: '广西' },
                { label: '海南', value: '海南' },
              ],
            },
          ],
          clearable: true,
        },
      },
      props: {},
    },
  ]

  const config = baseConfig(items, {
    item: { col: { xs: 12, sm: 12, md: 6 } },
    layout: { maxRows: 999, grid: { gutter: 12, rowGap: 12 } },
  })

  return (
    <div>
      <CwForm config={config} value={form} onChange={setForm} />
    </div>
  )
}

export const Default: Story = {
  render: (args) => <DefaultFormDemo {...args} />,
}

export const DisabledReadonly: Story = {
  render: () => <DisabledReadonlyDemo />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

export const LayoutAndMaxRows: Story = {
  render: () => <LayoutAndMaxRowsDemo />,
}

export const LabelOnLeftItems: Story = {
  render: () => <LabelOnLeftItemsDemo />,
}

export const FilterRowWithActions: Story = {
  render: () => <FilterRowWithActionsDemo />,
}

export const AdvancedLayoutAndCollapse: Story = {
  render: () => <AdvancedLayoutAndCollapseDemo />,
}

export const CrossFieldValidation: Story = {
  render: () => <CrossFieldValidationDemo />,
}

export const ComprehensiveExample: Story = {
  render: () => <ComprehensiveExampleDemo />,
}

export const Disabled: Story = {
  render: () => <CwForm config={twoFieldConfig} value={{ name: '禁用', email: '' }} disabled />,
}

export const Readonly: Story = {
  render: () => <CwForm config={twoFieldConfig} value={{ name: '只读', email: '' }} readonly />,
}
