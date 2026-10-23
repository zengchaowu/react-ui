import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { storyAlert } from '../../storybook/storyAlert'
import { CwEditableEmail } from './CwEditableEmail'

const meta: Meta<typeof CwEditableEmail> = {
  title: '1. Components/Form/CwEditableEmail',
  component: CwEditableEmail,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '一个可编辑的邮箱组件，默认显示预览邮箱和编辑图标，点击后进入编辑模式，使用 CwAutoCompleteEmail 提供邮箱自动补全功能，失去焦点时调用异步修改函数。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: '当前值',
    },
    asyncModify: {
      description: '异步修改函数，返回 Promise<boolean>',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    placeholder: {
      control: { type: 'text' },
      description: '占位符文本',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: '文本对齐方式',
    },
    emailSuffixes: {
      description: '邮箱后缀列表',
    },
    debounce: {
      control: { type: 'number' },
      description: '输入防抖毫秒',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function formatValue(value: string | null | undefined) {
  return value === null || value === undefined
    ? '(未设置)'
    : value || '(空字符串)'
}

function ControlledEditableEmail(
  props: ComponentProps<typeof CwEditableEmail> & { hint?: string },
) {
  const { hint, ...rest } = props
  const [value, setValue] = useState<string | null>(rest.value ?? 'user@example.com')
  return (
    <div className="w-[25rem] p-4">
      <CwEditableEmail {...rest} value={value} onChange={(nextValue) => setValue(nextValue)} />
      <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
        {hint ?? `当前值：${formatValue(value)}`}
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    value: 'user@example.com',
    placeholder: '请输入邮箱',
    align: 'left',
  },
  render: (args) => <ControlledEditableEmail {...args} />,
}

export const WithAsyncModify: Story = {
  args: {
    value: 'user@example.com',
    placeholder: '请输入邮箱',
    asyncModify: async (newValue: string | null) => {
      // 模拟异步请求（2秒延迟）
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // 模拟验证：如果包含 "invalid" 则失败
      if (newValue && newValue.includes('invalid')) {
        storyAlert('修改失败：不能包含"invalid"关键字')
        return false
      }
      return true
    },
  },
  render: (args) => (
    <div className="w-[25rem] p-4">
      <div className="mb-4 rounded-lg bg-[var(--button-brand-tint-hover-bg)] p-3">
        <p className="text-sm text-[var(--brand-color-6)]">
          <strong>异步修改示例：</strong>
          <br />• 点击文本或编辑图标进入编辑模式
          <br />• 输入邮箱时会有自动补全提示（输入@后显示后缀建议）
          <br />• 修改后失去焦点会调用异步修改函数（2秒延迟）
          <br />• 如果输入包含"invalid"关键字，修改会失败，显示旧值
          <br />• 修改成功会显示新值，失败会恢复旧值
          <br />• 查看控制台了解详细日志
        </p>
      </div>
      <ControlledEditableEmail
        {...args}
        hint={undefined}
        onSuccess={(newValue) => console.log('修改成功事件：', newValue)}
        onError={(error) => console.log('修改失败事件：', error)}
      />
    </div>
  ),
}

export const Readonly: Story = {
  args: {
    value: 'user@example.com',
    readonly: true,
    placeholder: '请输入邮箱',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableEmail
      {...args}
      hint="只读模式下不显示编辑图标，无法进入编辑模式，但可以聚焦并显示聚焦环"
    />
  ),
}

export const Disabled: Story = {
  args: {
    value: 'user@example.com',
    disabled: true,
    placeholder: '请输入邮箱',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableEmail
      {...args}
      hint="禁用模式下不显示编辑图标，无法进入编辑模式，不可聚焦"
    />
  ),
}

function EmptyDemo() {
  const [value, setValue] = useState<string | null>(null)
  const asyncModify = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
  return (
    <div className="w-[25rem] p-4">
      <div className="mb-4 rounded-lg bg-[var(--bg-color-component)] p-3">
        <p className="text-sm text-[var(--text-color-secondary)]">
          <strong>空值示例：</strong>
          <br />• 当 value 为 null/undefined 时，显示 placeholder
          <br />• 当 value 为空字符串时，显示空字符串（不显示 placeholder）
        </p>
      </div>
      <CwEditableEmail
        value={value}
        asyncModify={asyncModify}
        placeholder="请输入邮箱"
        align="left"
        onChange={(nextValue) => setValue(nextValue)}
      />
      <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
        当前值：{formatValue(value)}
      </div>
    </div>
  )
}

export const Empty: Story = {
  args: {
    value: null,
    placeholder: '请输入邮箱',
    align: 'left',
  },
  render: () => <EmptyDemo />,
}

function MultipleDemo() {
  const [values, setValues] = useState<{ v1: string | null; v2: string | null; v3: string | null; v4: string | null }>({
    v1: 'user@example.com',
    v2: 'admin@example.com',
    v3: 'test@example.com',
    v4: null,
  })

  const asyncModify = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  return (
    <div className="w-[25rem] space-y-4 p-4">
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">默认</div>
        <CwEditableEmail
          value={values.v1}
          asyncModify={asyncModify}
          onChange={(v) => setValues((prev) => ({ ...prev, v1: v }))}
        />
      </div>
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">只读</div>
        <CwEditableEmail
          value={values.v2}
          readonly
          onChange={(v) => setValues((prev) => ({ ...prev, v2: v }))}
        />
      </div>
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">禁用</div>
        <CwEditableEmail
          value={values.v3}
          disabled
          onChange={(v) => setValues((prev) => ({ ...prev, v3: v }))}
        />
      </div>
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">
          空值（显示 placeholder）
        </div>
        <CwEditableEmail
          value={values.v4}
          asyncModify={asyncModify}
          placeholder="请输入邮箱"
          onChange={(v) => setValues((prev) => ({ ...prev, v4: v }))}
        />
      </div>
    </div>
  )
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
}
