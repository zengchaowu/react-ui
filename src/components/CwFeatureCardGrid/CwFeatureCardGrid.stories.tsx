import type { Meta, StoryObj } from '@storybook/react'
import { CwFeatureCardGrid } from './CwFeatureCardGrid'
import type { CwFeatureCardItem } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwFeatureCardGrid> = {
  title: '1. Components/Display/CwFeatureCardGrid',
  component: CwFeatureCardGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 12, step: 1 },
      description: '固定列数（layout=fixed 时）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwFeatureCardGrid>

const sampleItems: CwFeatureCardItem[] = [
  { key: 'pending', label: '待支付', icon: 'common--commerce--product-line' },
  { key: 'quote', label: '车险报价', icon: 'common--action--revert-line' },
  { key: 'car', label: '车险订单', icon: 'common--action--revert-line' },
  { key: 'person', label: '个险订单', icon: 'common--user--user-line' },
  { key: 'group', label: '团险订单', icon: 'chat--social--friend-line' },
]

export const FixedColumns: Story = {
  args: {
    title: '订单',
    items: sampleItems,
    layout: 'fixed',
    columns: 5,
    appearance: 'default',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <CwFeatureCardGrid {...args} />
    </div>
  ),
}

export const HomeAppearance: Story = {
  args: {
    title: '核心能力',
    items: sampleItems.map((item, i) => ({
      ...item,
      description: i === 0 ? '示例描述文案' : undefined,
    })),
    layout: 'fixed',
    columns: 3,
    appearance: 'home',
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <CwFeatureCardGrid {...args} />
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    title: '订单',
    items: sampleItems,
    layout: 'fixed',
    columns: 4,
  },
  render: (args) => (
    <SlotStorySection slot="icon">
      <div className="w-[20rem]">
        <CwFeatureCardGrid
          {...args}
          iconSlot={({ item }) => (
            <span className="text-xs font-semibold text-[var(--brand-color-6)]">
              {item.label.slice(0, 1)}
            </span>
          )}
        />
      </div>
    </SlotStorySection>
  ),
}

export const AutoGrow: Story = {
  args: {
    title: '订单',
    items: sampleItems,
    layout: 'auto',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <CwFeatureCardGrid {...args} />
    </div>
  ),
}
