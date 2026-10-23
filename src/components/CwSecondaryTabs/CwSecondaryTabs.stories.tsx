import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwSecondaryTabs } from './CwSecondaryTabs'
import type { CwSecondaryTabItem, CwSecondaryTabsProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwSecondaryTabs> = {
  title: '1. Components/Navigation/CwSecondaryTabs',
  component: CwSecondaryTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '二级 Tab：轻量标签样式，支持 activeTab 双向绑定、等分宽度、stats 变体。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeTab: {
      control: 'text',
      description: '当前选中 tab 值（v-model:activeTab）',
    },
    tabs: { control: 'object', description: 'tab 列表' },
    equalWidth: { control: 'boolean', description: '是否等分宽度' },
    variant: {
      control: 'select',
      options: ['default', 'stats'],
      description: '外观变体',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwSecondaryTabs>

/** 受控包装：内部同步 activeTab，模拟 v-model:activeTab */
function ControlledSecondaryTabs(props: CwSecondaryTabsProps) {
  const [active, setActive] = useState(props.activeTab)
  return (
    <CwSecondaryTabs {...props} activeTab={active} onActiveTabChange={setActive} />
  )
}

function TabSlotDemo(props: CwSecondaryTabsProps) {
  const [active, setActive] = useState(props.activeTab)
  return (
    <CwSecondaryTabs
      {...props}
      activeTab={active}
      onActiveTabChange={setActive}
      tabSlot={(scope: { tab: CwSecondaryTabItem }) => (
        <>
          <span className="text-xs font-normal text-[var(--text-color-secondary)]">
            {scope.tab.label}
          </span>
          {scope.tab.count !== undefined ? (
            <span className="ml-0.5 text-xs font-semibold text-[var(--text-color-primary)]">
              {scope.tab.count}
            </span>
          ) : null}
        </>
      )}
    />
  )
}

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'ok' },
]

export const Default: Story = {
  args: {
    activeTab: 'car',
    equalWidth: false,
    tabs: [
      { label: '车险', value: 'car' },
      { label: '寿险', value: 'life' },
      { label: '团险', value: 'group' },
      { label: '个险', value: 'personal' },
    ],
  },
  render: (args) => {
    function DefaultDemo() {
      const [active, setActive] = useState(args.activeTab)
      return (
        <div className="min-h-screen bg-[var(--bg-color-container)] p-4">
          <div className="mb-2 text-xs text-[var(--text-color-secondary)]">
            自适应宽度（equalWidth: false）
          </div>
          <CwSecondaryTabs
            {...args}
            activeTab={active}
            onActiveTabChange={setActive}
          />
          <div className="mt-3 text-xs text-[var(--text-color-secondary)]">
            activeTab: {active}
          </div>
        </div>
      )
    }
    return <DefaultDemo />
  },
}

export const EqualWidth: Story = {
  args: {
    activeTab: 'all',
    equalWidth: true,
    tabs: [
      { label: '全部', value: 'all' },
      { label: '保障中', value: 'active' },
      { label: '待续保', value: 'pending_renewal' },
      { label: '已失效', value: 'expired' },
    ],
  },
  render: (args) => {
    function EqualWidthDemo() {
      const [active, setActive] = useState(args.activeTab)
      return (
        <div className="min-h-screen bg-[var(--bg-color-container)] p-4">
          <div className="mb-2 text-xs text-[var(--text-color-secondary)]">
            等分宽度（equalWidth: true）
          </div>
          <CwSecondaryTabs
            {...args}
            activeTab={active}
            onActiveTabChange={setActive}
          />
          <div className="mt-3 text-xs text-[var(--text-color-secondary)]">
            activeTab: {active}
          </div>
        </div>
      )
    }
    return <EqualWidthDemo />
  },
}

const slotTabs: CwSecondaryTabItem[] = [
  { label: '全部', value: '', count: undefined },
  { label: '个人客户', value: 'personal', count: 123 },
  { label: '企业客户', value: 'enterprise', count: 45 },
]

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="bg-[var(--bg-color-secondarycontainer)] p-4">
      <SlotStorySection slot="tab">
        <TabSlotDemo
          activeTab="personal"
          equalWidth={false}
          variant="stats"
          tabs={slotTabs}
        />
      </SlotStorySection>
    </div>
  ),
}

export const StatsWithSlot: Story = {
  args: {
    activeTab: 'personal',
    equalWidth: false,
    variant: 'stats',
    tabs: [
      { label: '全部', value: '', count: undefined },
      { label: '个人客户', value: 'personal', count: 123 },
      { label: '企业/机关客户', value: 'enterprise', count: 45 },
      { label: '近期过生日', value: 'birthday', count: 8 },
    ],
  },
  render: (args) => {
    function StatsWithSlotDemo() {
      const [active, setActive] = useState(args.activeTab)
      return (
        <div className="min-h-screen bg-[var(--bg-color-secondarycontainer)] p-4">
          <div className="mb-2 text-xs text-[var(--text-color-secondary)]">
            stats 变体 + tab 插槽（label + 数量）
          </div>
          <CwSecondaryTabs
            {...args}
            activeTab={active}
            onActiveTabChange={setActive}
            tabSlot={(scope: { tab: CwSecondaryTabItem }) => (
              <>
                <span className="text-xs font-normal text-[var(--text-color-secondary)]">
                  {scope.tab.label}
                </span>
                {scope.tab.count !== undefined ? (
                  <span className="ml-0.5 text-xs font-semibold text-[var(--text-color-primary)]">
                    {scope.tab.count}
                  </span>
                ) : null}
              </>
            )}
          />
        </div>
      )
    }
    return <StatsWithSlotDemo />
  },
}

