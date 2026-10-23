import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwEditableText } from './CwEditableText'
import type { CwEditableTextProps } from './types'
import { storyAlert } from '../../storybook/storyAlert'

const meta: Meta<typeof CwEditableText> = {
  title: '1. Components/Form/CwEditableText',
  component: CwEditableText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '一个可编辑的文本组件，默认 appearance 为 plain（裸输入）。默认显示预览文本和编辑图标，点击后进入编辑模式，失去焦点时调用异步修改函数。',
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
    editIconVisibility: {
      control: { type: 'select' },
      options: ['always', 'hover', 'never'],
      description: '编辑图标显示时机：always 始终显示；hover 悬停/聚焦时显示；never 不显示',
    },
    appearance: {
      control: { type: 'select' },
      options: ['plain', 'default', 'field-inline', 'title'],
      description:
        '场景外观；默认 plain（无边框裸输入）；title 为标题字号 + plain 编辑；default / field-inline 为带框输入',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwEditableText>

/** 异步修改函数（2 秒延迟，包含「错误」则失败） */
const asyncModify = async (newValue: string): Promise<boolean> => {
  console.log('开始修改，新值：', newValue)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  if (newValue.includes('错误')) {
    console.log('修改失败：包含"错误"关键字')
    storyAlert('修改失败：不能包含"错误"关键字')
    return false
  }
  console.log('修改成功')
  return true
}

const shortAsyncModify = async (): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}

const plainAsyncModify = async (): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  return true
}

type EditableArgs = Omit<Partial<CwEditableTextProps>, 'value'>

function ControlledEditableText({
  initialValue,
  frameClassName = 'w-[25rem] p-4',
  note,
  showValue = true,
  placeholder,
  texts,
  onChange,
  ...args
}: EditableArgs & {
  initialValue?: string
  frameClassName?: string
  note?: ReactNode
  showValue?: boolean
}) {
  const [value, setValue] = useState<string | undefined>(initialValue)
  return (
    <div className={frameClassName}>
      {note}
      <CwEditableText
        {...args}
        texts={placeholder === undefined ? texts : { placeholder, ...texts }}
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
      />
      {showValue ? (
        <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
          当前值：{value === undefined || value === null ? '(未设置)' : value || '(空字符串)'}
        </div>
      ) : null}
    </div>
  )
}

function TextAlignDemo() {
  const [left, setLeft] = useState('左对齐文本')
  const [right, setRight] = useState('右对齐文本')
  const boxClass =
    'w-full rounded border border-dashed border-[var(--border-color)] px-2 py-1'
  return (
    <div className="w-[25rem] space-y-4 p-4">
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">左对齐（默认）</div>
        <div className={boxClass}>
          <CwEditableText
            value={left}
            align="left"
            asyncModify={plainAsyncModify}
            onChange={setLeft}
          />
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm text-[var(--text-color-secondary)]">右对齐</div>
        <div className={boxClass}>
          <CwEditableText
            value={right}
            align="right"
            asyncModify={plainAsyncModify}
            onChange={setRight}
          />
        </div>
      </div>
    </div>
  )
}

function MultipleDemo() {
  const [v1, setV1] = useState<string | undefined>('默认文本')
  const [v2, setV2] = useState<string | undefined>('只读文本')
  const [v3, setV3] = useState<string | undefined>('禁用文本')
  const [v4, setV4] = useState<string | undefined>(undefined)
  const labelClass = 'mb-2 text-sm text-[var(--text-color-secondary)]'
  return (
    <div className="w-[25rem] space-y-4 p-4">
      <div>
        <div className={labelClass}>默认</div>
        <CwEditableText value={v1} asyncModify={plainAsyncModify} onChange={setV1} />
      </div>
      <div>
        <div className={labelClass}>只读</div>
        <CwEditableText value={v2} readonly onChange={setV2} />
      </div>
      <div>
        <div className={labelClass}>禁用</div>
        <CwEditableText value={v3} disabled onChange={setV3} />
      </div>
      <div>
        <div className={labelClass}>空值（显示 placeholder）</div>
        <CwEditableText
          value={v4}
          asyncModify={plainAsyncModify}
          texts={{ placeholder: '请输入内容' }}
          onChange={setV4}
        />
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    value: '可编辑文本',
    placeholder: '请输入内容',
    align: 'left',
  },
  render: (args) => <ControlledEditableText {...args} initialValue={args.value} />,
}

export const WithAsyncModify: Story = {
  args: {
    value: '点击编辑图标修改',
    placeholder: '请输入内容',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={args.value}
      asyncModify={asyncModify}
      note={
        <div className="mb-4 rounded-lg bg-[var(--button-brand-tint-hover-bg)] p-3">
          <p className="text-sm text-[var(--brand-color-6)]">
            <strong>异步修改示例：</strong>
            <br />• 点击文本或编辑图标进入编辑模式
            <br />• 修改后失去焦点会调用异步修改函数（2秒延迟）
            <br />• 如果输入包含"错误"关键字，修改会失败，显示旧值
            <br />• 修改成功会显示新值，失败会恢复旧值
            <br />• 查看控制台了解详细日志
          </p>
        </div>
      }
      onSuccess={(value) => console.log('修改成功事件：', value)}
      onError={(error) => console.log('修改失败事件：', error)}
    />
  ),
}

export const Readonly: Story = {
  args: {
    value: '只读文本',
    readonly: true,
    placeholder: '请输入内容',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={args.value}
      note={
        <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
          只读模式下不显示编辑图标，无法进入编辑模式，但可以聚焦并显示聚焦环
        </div>
      }
      showValue={false}
    />
  ),
}

export const Disabled: Story = {
  args: {
    value: '禁用文本',
    disabled: true,
    placeholder: '请输入内容',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={args.value}
      note={
        <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
          禁用模式下不显示编辑图标，无法进入编辑模式，不可聚焦
        </div>
      }
      showValue={false}
    />
  ),
}

export const Empty: Story = {
  args: {
    value: undefined,
    placeholder: '请输入内容',
    align: 'left',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={undefined}
      asyncModify={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return true
      }}
      note={
        <div className="mb-4 rounded-lg bg-[var(--bg-color-component)] p-3">
          <p className="text-sm text-[var(--text-color-secondary)]">
            <strong>空值示例：</strong>
            <br />• 当 value 为 undefined/null 时，显示 placeholder
            <br />• 当 value 为空字符串时，显示空字符串（不显示 placeholder）
          </p>
        </div>
      }
    />
  ),
}

export const EditIconOnHover: Story = {
  args: {
    value: '悬停显示编辑图标',
    placeholder: '请输入内容',
    editIconVisibility: 'hover',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={args.value}
      asyncModify={shortAsyncModify}
      note={
        <div className="mt-4 text-sm text-[var(--text-color-secondary)]">
          鼠标悬停或键盘聚焦预览区时才会显示编辑图标
        </div>
      }
      showValue={false}
    />
  ),
}

export const Plain: Story = {
  args: {
    value: '裸输入框重命名',
    appearance: 'plain',
    editIconVisibility: 'never',
    placeholder: '名称',
  },
  render: (args) => (
    <ControlledEditableText
      {...args}
      initialValue={args.value}
      asyncModify={plainAsyncModify}
      frameClassName="w-[12rem] rounded border border-dashed border-[var(--border-color)] p-2 text-sm"
      note={
        <p className="mb-2 text-xs text-[var(--text-color-secondary)]">
          点击进入编辑；失焦保存时右侧显示小号 loading，行高不变。
        </p>
      }
      showValue={false}
    />
  ),
}

/** 外层含 -webkit-line-clamp 时勿把该类挂到 CwEditableText 根节点 */
export const PlainWithLineClampHost: Story = {
  args: {
    value: '文件夹',
    appearance: 'plain',
    editIconVisibility: 'never',
    defaultEditing: true,
    placeholder: '名称',
  },
  render: (args) => (
    <LineClampHostDemo {...args} initialValue={args.value} />
  ),
  decorators: [
    (Story) => (
      <div>
        <style>{`
          .plain-line-clamp-host-demo {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            padding: 0.0625rem 0.1875rem;
            font-size: 0.75rem;
            line-height: 1.25;
            text-align: center;
            word-break: break-word;
          }
        `}</style>
        <Story />
      </div>
    ),
  ],
}

function LineClampHostDemo({
  initialValue,
  placeholder,
  texts,
  ...args
}: EditableArgs & { initialValue?: string }) {
  const [value, setValue] = useState<string | undefined>(initialValue)
  return (
    <div className="w-[5.5rem] p-2 text-center">
      <p className="mb-2 text-xs text-[var(--text-color-secondary)]">
        外层 label 含 -webkit-line-clamp（勿挂 CwEditableText 根节点）
      </p>
      <span className="plain-line-clamp-host-demo inline-block max-w-full">
        <CwEditableText
          {...args}
          texts={placeholder === undefined ? texts : { placeholder, ...texts }}
          value={value}
          asyncModify={plainAsyncModify}
          onChange={setValue}
        />
      </span>
    </div>
  )
}

export const TextAlign: Story = {
  render: () => <TextAlignDemo />,
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
}

export const AsyncModify: Story = {
  args: {
    value: '异步保存',
    asyncModify: (next: string) =>
      new Promise<boolean>((resolve) => setTimeout(() => resolve(Boolean(next)), 600)),
  },
}
