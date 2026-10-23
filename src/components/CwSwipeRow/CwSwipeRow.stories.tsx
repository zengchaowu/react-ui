import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwSwipeRow } from './CwSwipeRow'
import type { CwSwipeRowAction, CwSwipeRowProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const demoSwipeActions: CwSwipeRowAction[] = [
  { key: 'mute', label: '免打扰', tone: 'muted' },
  { key: 'pin', label: '置顶', tone: 'primary' },
  { key: 'delete', label: '删除', tone: 'danger' },
]

const rowContentClass =
  'px-4 py-3 bg-[var(--bg-color-container)] text-sm text-[var(--text-color-primary)]'

const meta: Meta<typeof CwSwipeRow> = {
  title: '1. Components/Display/CwSwipeRow',
  component: CwSwipeRow,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CwSwipeRow 用于列表行左滑露出操作区（Pointer Events：触摸与鼠标拖拽均可），支持同行互斥展开（swipePeerOpenKey）与多种操作按钮语义色。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showBodyInsetDivider: {
      control: { type: 'boolean' },
      description: '是否显示行内缩进底部分割线',
    },
    swipeActions: {
      control: false,
      description: '左滑操作项；为空时退化为普通行',
    },
    swipeRowKey: {
      control: { type: 'text' },
      description: '当前行唯一键，用于互斥展开',
    },
    swipePeerOpenKey: {
      control: false,
      description: '列表级当前展开行键（由父级维护）',
    },
    onClick: { action: 'click' },
    onSwipeAction: { action: 'swipe-action' },
    onSwipeOpenChange: { action: 'swipe-open-change' },
  },
}

export default meta
type Story = StoryObj<typeof CwSwipeRow>

export const PlainRow: Story = {
  args: {
    // 单行 + 外层 border 时不要开内缩分割线，否则会叠在底边上看成「多一条线」
    showBodyInsetDivider: false,
    contentClass: rowContentClass,
  },
  render: (args) => (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)]">
      <CwSwipeRow
        {...args}
        onClick={(event) => {
          console.log('row click', event)
        }}
      >
        无 swipeActions 时与普通行一致
      </CwSwipeRow>
    </div>
  ),
}

function OpenableSwipeRow(props: CwSwipeRowProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)]">
      <CwSwipeRow
        {...props}
        swipePeerOpenKey={openKey}
        onSwipeOpenChange={setOpenKey}
      >
        按住向左拖动露出操作（鼠标 / 触摸均可）
      </CwSwipeRow>
    </div>
  )
}

export const WithSwipeActions: Story = {
  args: {
    swipeRowKey: 'demo-row',
    swipeActions: demoSwipeActions,
    // 单行 + 外层 border：勿开内缩分割线，避免与底边框叠线
    showBodyInsetDivider: false,
    contentClass: rowContentClass,
  },
  render: (args) => <OpenableSwipeRow {...args} />,
}

const demoRows = [
  { key: 'row-1', title: '设计评审群' },
  { key: 'row-2', title: '产品周会' },
  { key: 'row-3', title: '张三' },
]

const exclusiveActions: CwSwipeRowAction[] = [
  { key: 'mute', label: '免打扰', tone: 'muted' },
  { key: 'delete', label: '删除', tone: 'danger' },
]

function ExclusiveSwipeRowList() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)] divide-y divide-[var(--border-color)]">
      {demoRows.map((row) => (
        <CwSwipeRow
          key={row.key}
          swipeRowKey={row.key}
          swipePeerOpenKey={openKey}
          swipeActions={exclusiveActions}
          contentClass={rowContentClass}
          onSwipeOpenChange={setOpenKey}
        >
          {row.title}
        </CwSwipeRow>
      ))}
    </div>
  )
}

export const MultipleRowsExclusiveOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '同一列表内通过 swipePeerOpenKey 保证仅一行处于展开状态，适用于会话列表等场景。',
      },
    },
  },
  render: () => <ExclusiveSwipeRowList />,
}

const toneActions: CwSwipeRowAction[] = [
  { key: 'default', label: '默认', tone: 'default' },
  { key: 'primary', label: '主要', tone: 'primary' },
  { key: 'muted', label: '次要', tone: 'muted' },
  { key: 'warning', label: '警告', tone: 'warning' },
  { key: 'danger', label: '危险', tone: 'danger' },
]

function ActionTonesRow() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="w-[22.5rem] rounded-lg overflow-hidden border border-[var(--border-color)]">
      <CwSwipeRow
        swipeRowKey="tones"
        swipePeerOpenKey={openKey}
        swipeActions={toneActions}
        contentClass="px-4 py-3 bg-[var(--bg-color-container)] text-sm text-[var(--text-color-secondary)]"
        onSwipeOpenChange={setOpenKey}
      >
        左滑查看五种 tone
      </CwSwipeRow>
    </div>
  )
}

export const ActionTones: Story = {
  render: () => <ActionTonesRow />,
}

function SlotSwipeRow() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="w-[22.5rem] overflow-hidden rounded-lg border border-[var(--border-color)]">
      <CwSwipeRow
        swipeRowKey="slot-demo"
        swipeActions={demoSwipeActions}
        showBodyInsetDivider={false}
        contentClass={rowContentClass}
        swipePeerOpenKey={openKey}
        onSwipeOpenChange={setOpenKey}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-color-6)] text-xs text-[var(--text-color-anti)]">
            自
          </span>
          <div>
            <div className="font-medium">自定义行内容</div>
            <div className="text-xs text-[var(--text-color-secondary)]">
              默认插槽内容
            </div>
          </div>
        </div>
      </CwSwipeRow>
    </div>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="default">
      <SlotSwipeRow />
    </SlotStorySection>
  ),
}
