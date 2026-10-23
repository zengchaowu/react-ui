import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwCellForm } from './CwCellForm'
import { CwInput } from '../CwInput'
import type { CwCellFormItemConfig } from './types'

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

const items: CwCellFormItemConfig[] = [
  inputItem('name', '姓名', { required: true }),
  inputItem('email', '邮箱', { required: true }),
  inputItem('phone', '手机号', { required: true, showDivider: false }),
]

function CellFormDemo() {
  const [value, setValue] = useState<Record<string, unknown>>({
    name: '',
    email: '',
    phone: '',
  })
  return (
    <div className="max-w-md">
      <CwCellForm
        title="基本信息"
        items={items}
        value={value}
        onChange={(next) => setValue(next)}
      />
      <pre className="mt-4 p-4 bg-[var(--bg-color-component)] rounded">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

const meta: Meta<typeof CwCellForm> = {
  title: '1. Components/Form/CwCellForm',
  component: CwCellForm,
  args: {
    title: '基本信息',
    items,
    value: {},
  },
}

export default meta
type Story = StoryObj<typeof CwCellForm>

export const Default: Story = {
  render: () => <CellFormDemo />,
}

export const Disabled: Story = {
  render: () => (
    <CwCellForm
      title="基本信息"
      items={items}
      value={{ name: '张三', email: 'zhangsan@example.com', phone: '13800138000' }}
      disabled
    />
  ),
}

export const Readonly: Story = {
  render: () => (
    <CwCellForm
      title="基本信息"
      items={items}
      value={{ name: '李四', email: 'lisi@example.com', phone: '13900139000' }}
      readonly
    />
  ),
}
