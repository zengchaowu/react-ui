import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwFormItem } from './CwFormItem'
import { CwInput } from '../CwInput'
import type {
  CwFormItemConfig,
  CwFormItemErrorSlotScope,
  CwFormItemLabelSlotScope,
  ValidationResult,
} from './types'

// 工具：创建基础输入表单项配置
function createInputConfig(overrides: Partial<CwFormItemConfig> = {}): CwFormItemConfig {
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
  validationResult,
  labelSlot,
  errorSlot,
  wrapperClass = 'w-[22.5rem]',
}: {
  config: CwFormItemConfig
  initialValue?: unknown
  validationResult?: ValidationResult
  labelSlot?: (scope: CwFormItemLabelSlotScope) => React.ReactNode
  errorSlot?: (scope: CwFormItemErrorSlotScope) => React.ReactNode
  wrapperClass?: string
}) {
  const [value, setValue] = useState<unknown>(initialValue)
  return (
    <div className={wrapperClass}>
      <CwFormItem
        config={config}
        value={value}
        validationResult={validationResult}
        onChange={(next) => setValue(next)}
        labelSlot={labelSlot}
        errorSlot={errorSlot}
      />
    </div>
  )
}

const meta: Meta<typeof CwFormItem> = {
  title: '1. Components/Form/CwFormItem',
  component: CwFormItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwFormItem 是表单项容器，通过 config.componentConfig 动态渲染内部控件（如 CwInput），支持标签、禁用/只读、必填标记、验证信息、插槽自定义等。',
      },
    },
  },
  args: {},
  argTypes: {
    config: { control: { type: 'object' }, description: '表单项配置（包含内部组件与属性）' },
    validationResult: { control: { type: 'object' }, description: '外部传入的校验结果显示' },
    texts: { control: { type: 'object' }, description: '文本覆盖' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    config: createInputConfig(),
    validationResult: undefined,
    value: '',
  },
  render: (args) => <FormItemDemo config={args.config} validationResult={args.validationResult} />,
}

export const RequiredValidation: Story = {
  args: {
    config: createInputConfig({ required: true, label: '必填字段' }),
    validationResult: undefined,
    value: '',
  },
  render: (args) => <FormItemDemo config={args.config} validationResult={args.validationResult} />,
}

export const DisabledAndReadonly: Story = {
  args: {},
  render: () => (
    <div className="w-[22.5rem] space-y-4">
      <FormItemDemo
        config={createInputConfig({ label: '禁用', disabled: true })}
        initialValue="禁止输入"
      />
      <FormItemDemo
        config={createInputConfig({ label: '只读', readonly: true })}
        initialValue="只读示例"
      />
    </div>
  ),
}

const slotConfig = createInputConfig({
  label: '邮箱',
  required: true,
  componentConfig: {
    component: CwInput,
    defaultProps: { placeholder: 'name@example.com', clearable: true },
  },
})

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[25rem] flex-col gap-8">
      <SlotStorySection slot="label">
        <FormItemDemo
          config={slotConfig}
          labelSlot={(scope) => (
            <span className="text-sm font-medium text-[var(--brand-color-6)]">
              {scope.config.label}（自定义标签）
            </span>
          )}
        />
      </SlotStorySection>
      <SlotStorySection slot="error">
        <FormItemDemo
          config={slotConfig}
          validationResult={{ valid: false, message: '请填写有效邮箱' }}
          errorSlot={(scope) => (
            <p className="text-xs text-[var(--error-color-6)]">
              自定义错误：{scope.validationResult?.message}
            </p>
          )}
        />
      </SlotStorySection>
    </div>
  ),
}

export const LabelOnLeft: Story = {
  args: {
    config: createInputConfig({
      label: '左侧标签',
      labelWidth: '120px',
      required: true,
      appearance: 'filter-row',
    }),
    value: '',
  },
  render: (args) => <FormItemDemo config={args.config} wrapperClass="w-[32.5rem]" />,
}
