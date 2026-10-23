import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwFormItem } from './CwFormItem'
import { CwInput } from '../CwInput'
import type { CwFormItemConfig } from './types'

function createInputConfig(
  overrides: Partial<CwFormItemConfig> = {},
): CwFormItemConfig {
  return {
    prop: 'name',
    label: '名称',
    required: false,
    componentConfig: {
      component: CwInput,
      defaultProps: {
        placeholder: '请输入名称',
        clearable: true,
      },
    },
    props: {},
    ...overrides,
  }
}

function FormItemDemo({
  config,
  initialValue = '',
}: {
  config: CwFormItemConfig
  initialValue?: string
}) {
  const [value, setValue] = useState<unknown>(initialValue)
  return (
    <div className="w-[22.5rem]">
      <CwFormItem
        config={config}
        value={value}
        onChange={(next) => setValue(next)}
      />
    </div>
  )
}

const meta: Meta<typeof CwFormItem> = {
  title: '1. Components/Form/CwFormItem',
  component: CwFormItem,
  args: {
    config: createInputConfig(),
    value: '',
  },
}

export default meta
type Story = StoryObj<typeof CwFormItem>

export const Default: Story = {
  render: (args) => <FormItemDemo config={args.config} />,
}

export const RequiredValidation: Story = {
  render: () => (
    <FormItemDemo
      config={createInputConfig({ required: true, label: '必填字段' })}
    />
  ),
}

export const LabelOnLeft: Story = {
  render: () => (
    <FormItemDemo
      config={createInputConfig({
        label: '左侧标签',
        labelWidth: '120px',
        required: true,
        appearance: 'filter-row',
      })}
    />
  ),
}
