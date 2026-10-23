import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwFilterSheet } from './CwFilterSheet'
import { showFilterSheet } from './showFilterSheet'
import type {
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

const meta: Meta<typeof CwFilterSheet> = {
  title: '1. Components/Overlay/CwFilterSheet',
  component: CwFilterSheet,
  parameters: { layout: 'centered' },
  args: {
    title: '全部筛选',
    sections: defaultSections,
    disabled: false,
    readonly: false,
  },
}

export default meta
type Story = StoryObj<typeof CwFilterSheet>

function ComponentDemo({
  sections,
  title,
}: {
  sections: CwFilterSheetSection[]
  title?: string
}) {
  const handleRef = useRef<CwFilterSheetHandle | null>(null)

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className="px-4 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded-lg"
        onClick={() => handleRef.current?.show()}
      >
        打开筛选 Sheet
      </div>
      <CwFilterSheet
        ref={handleRef}
        title={title}
        sections={sections}
        onConfirm={(values: CwFilterSheetValues) => console.log('确认筛选:', values)}
        onReset={() => console.log('重置筛选')}
      />
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <ComponentDemo sections={args.sections ?? defaultSections} title={args.title} />
  ),
}

export const FunctionAPI: Story = {
  render: () => (
    <div
      role="button"
      tabIndex={0}
      className="px-4 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded-lg"
      onClick={() => {
        const { promise } = showFilterSheet({
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
  ),
}
