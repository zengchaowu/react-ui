import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSwipeRow } from './CwSwipeRow'
import type { CwSwipeRowAction } from './types'

const demoActions: CwSwipeRowAction[] = [
  { key: 'mute', label: '免打扰', tone: 'muted' },
  { key: 'pin', label: '置顶', tone: 'primary' },
  { key: 'delete', label: '删除', tone: 'danger' },
]

const rowContentClass =
  'px-4 py-3 bg-[var(--bg-color-container)] text-sm text-[var(--text-color-primary)]'

const meta: Meta<typeof CwSwipeRow> = {
  title: '1. Components/Display/CwSwipeRow',
  component: CwSwipeRow,
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof CwSwipeRow>

export const PlainRow: Story = {
  args: {
    contentClass: rowContentClass,
  },
  render: (args) => (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)]">
      <CwSwipeRow {...args}>无 swipeActions 时与普通行一致</CwSwipeRow>
    </div>
  ),
}

const demoRows = [
  { key: 'row-1', title: '设计评审群' },
  { key: 'row-2', title: '产品周会' },
  { key: 'row-3', title: '张三' },
]

function SwipeRowList() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)] divide-y divide-[var(--border-color)]">
      {demoRows.map((row) => (
        <CwSwipeRow
          key={row.key}
          swipeRowKey={row.key}
          swipePeerOpenKey={openKey}
          swipeActions={demoActions}
          contentClass={rowContentClass}
          onSwipeOpenChange={setOpenKey}
        >
          {row.title}
        </CwSwipeRow>
      ))}
    </div>
  )
}

export const WithSwipeActions: Story = {
  render: () => <SwipeRowList />,
}
