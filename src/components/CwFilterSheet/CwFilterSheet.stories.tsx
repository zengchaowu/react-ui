import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwFilterSheet } from './CwFilterSheet'
import { showFilterSheet } from './showFilterSheet'
import type {
  CwFilterSheetButton,
  CwFilterSheetHandle,
  CwFilterSheetSection,
  CwFilterSheetValues,
} from './types'

const defaultSections: CwFilterSheetSection[] = [
  {
    key: 'dateRange',
    title: '日期区间 (创建时间)',
    mode: 'single',
    options: [
      { value: 'week', label: '近1周' },
      { value: 'month', label: '近1个月' },
      { value: 'quarter', label: '近3个月' },
      { value: 'halfYear', label: '近半年' },
      { value: 'year', label: '近1年' },
      { value: 'all', label: '全部' },
    ],
    initialValue: 'halfYear',
    columns: 3,
  },
  {
    key: 'status',
    title: '订单状态',
    mode: 'single',
    options: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待确认' },
      { value: 'waiting', label: '等待支付' },
      { value: 'paid', label: '支付成功' },
      { value: 'success', label: '承保成功' },
      { value: 'failed', label: '承保失败' },
      { value: 'payFailed', label: '支付失败' },
      { value: 'canceled', label: '取消订单' },
    ],
    initialValue: 'all',
    columns: 3,
  },
]

const multipleSections: CwFilterSheetSection[] = [
  {
    key: 'tags',
    title: '标签（多选）',
    mode: 'multiple',
    options: [
      { value: 'tag1', label: '标签1' },
      { value: 'tag2', label: '标签2' },
      { value: 'tag3', label: '标签3' },
      { value: 'tag4', label: '标签4' },
      { value: 'tag5', label: '标签5' },
    ],
    initialValue: ['tag1', 'tag3'],
    columns: 3,
  },
  {
    key: 'category',
    title: '分类（单选）',
    mode: 'single',
    options: [
      { value: 'cat1', label: '分类1' },
      { value: 'cat2', label: '分类2' },
      { value: 'cat3', label: '分类3' },
    ],
    columns: 3,
  },
]

const customButtonSections: CwFilterSheetSection[] = [
  {
    key: 'status',
    title: '状态',
    mode: 'single',
    options: [
      { value: 'all', label: '全部' },
      { value: 'active', label: '活跃' },
      { value: 'inactive', label: '非活跃' },
    ],
    columns: 3,
  },
]

const triggerClass =
  'px-4 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded-lg'

const meta: Meta<typeof CwFilterSheet> = {
  title: '1. Components/Overlay/CwFilterSheet',
  component: CwFilterSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通用筛选 Sheet 组件，完全配置驱动。支持多个 section，每个 section 支持单选或多选，支持禁用和初始化值，底部按钮区域完全配置化。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: { type: 'text' }, description: 'Sheet 标题' },
    sections: { control: false, description: 'Section 配置' },
    buttons: { control: false, description: '底部按钮配置' },
    disabled: { control: { type: 'boolean' }, description: '是否禁用' },
    readonly: { control: { type: 'boolean' }, description: '是否只读' },
    texts: { control: false },
  },
  args: {
    title: '全部筛选',
    disabled: false,
    readonly: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <ComponentDemo
      sections={defaultSections}
      title={args.title}
      disabled={args.disabled}
      readonly={args.readonly}
    />
  ),
}

function ComponentDemo({
  sections,
  title,
  disabled,
  readonly,
}: {
  sections: CwFilterSheetSection[]
  title?: string
  disabled?: boolean
  readonly?: boolean
}) {
  const handleRef = useRef<CwFilterSheetHandle | null>(null)

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={triggerClass}
        onClick={() => handleRef.current?.show()}
      >
        打开筛选 Sheet
      </div>
      <CwFilterSheet
        ref={handleRef}
        title={title}
        sections={sections}
        disabled={disabled}
        readonly={readonly}
        onConfirm={(values: CwFilterSheetValues) => console.log('确认筛选:', values)}
        onReset={() => console.log('重置筛选')}
      />
    </div>
  )
}

function MultipleSelectDemo() {
  const handleRef = useRef<CwFilterSheetHandle | null>(null)

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={triggerClass}
        onClick={() => handleRef.current?.show()}
      >
        打开筛选 Sheet（多选示例）
      </div>
      <CwFilterSheet ref={handleRef} title="全部筛选" sections={multipleSections} />
    </div>
  )
}

export const WithMultipleSelect: Story = {
  render: () => <MultipleSelectDemo />,
}

function CustomButtonsDemo() {
  const handleRef = useRef<CwFilterSheetHandle | null>(null)

  const buttons: CwFilterSheetButton[] = [
    {
      label: '取消',
      type: 'secondary',
      onClick: (values) => {
        console.log('取消:', values)
        handleRef.current?.close()
      },
    },
    {
      label: '应用',
      type: 'primary',
      onClick: (values) => {
        console.log('应用筛选:', values)
        handleRef.current?.close()
      },
    },
  ]

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={triggerClass}
        onClick={() => handleRef.current?.show()}
      >
        打开筛选 Sheet（自定义按钮）
      </div>
      <CwFilterSheet
        ref={handleRef}
        title="全部筛选"
        sections={customButtonSections}
        buttons={buttons}
      />
    </div>
  )
}

export const WithCustomButtons: Story = {
  render: () => <CustomButtonsDemo />,
}

export const FunctionAPI: Story = {
  render: (args) => (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={triggerClass}
        onClick={() => {
          const { promise } = showFilterSheet({
            ...args,
            sections: defaultSections,
            onConfirm: (values) => console.log('确认筛选:', values),
            onReset: () => console.log('重置筛选'),
            onClose: () => console.log('关闭筛选'),
          })
          void promise.then((result) => console.log('筛选结果:', result))
        }}
      >
        使用函数式 API 打开筛选 Sheet
      </div>
    </div>
  ),
}
