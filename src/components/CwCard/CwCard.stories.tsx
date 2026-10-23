import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwCard } from './CwCard'
import { CwAvatar } from '../CwAvatar'
import { CwButtonGroup } from '../CwButtonGroup'

const meta: Meta<typeof CwCard> = {
  title: '1. Components/Display/CwCard',
  component: CwCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通用卡片组件，用于展示各种内容。包含 Header（通过 slot 自定义左右内容）和 Body（通过默认 slot 自定义内容）两部分。支持点击 header 折叠/展开（collapsible）、控制 header 底部分割线显隐（showHeaderDivider）。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    collapsible: {
      control: { type: 'boolean' },
      description: 'header 是否可折叠',
    },
    defaultExpanded: {
      control: { type: 'boolean' },
      description: '折叠模式下默认是否展开',
    },
    showHeaderDivider: {
      control: { type: 'boolean' },
      description: '是否显示 header 底部分割线',
    },
  },
  args: {
    collapsible: false,
    defaultExpanded: true,
    showHeaderDivider: true,
  },
}

export default meta
type Story = StoryObj<typeof CwCard>

export const Default: Story = {
  render: (args) => (
    <div className="w-[37.5rem]">
      <CwCard
        {...args}
        headerLeftSlot={
          <div className="text-sm text-[var(--text-color-secondary)]">2025-10-25 10:00</div>
        }
        headerRightSlot={
          <span className="px-2 py-1 rounded text-sm font-medium bg-[var(--warning-color-light)] text-[var(--warning-color-6)]">
            待确认
          </span>
        }
      >
        <div className="flex gap-4">
          <CwAvatar
            src={chatDefaultAvatar}
            fallbackSrc={chatDefaultAvatar}
            shape="square"
            size={4}
            text="产品"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="text-lg font-semibold text-[var(--text-color-primary)]">
                平安爱宠无忧
              </div>
              <div className="text-lg font-semibold text-[var(--text-color-primary)] flex-shrink-0">
                ¥1077.00
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <div className="text-sm text-[var(--text-color-secondary)]">
                <span>投保人: </span>
                <span>萧何</span>
              </div>
              <div className="text-sm text-[var(--text-color-secondary)]">
                <span>被保人: </span>
                <span>张良</span>
              </div>
              <div className="text-sm text-[var(--text-color-secondary)]">
                <span>保障期限: </span>
                <span>2024-11-28 至 2025-11-27</span>
              </div>
            </div>
            <div className="mt-4 pt-3 hairline-border-t border-[var(--border-color)]">
              <CwButtonGroup
                buttons={[
                  { id: 'detail', label: '订单详情', variant: 'secondary', onClick: () => console.log('订单详情') },
                  { id: 'send', label: '发给客户', variant: 'secondary', onClick: () => console.log('发给客户') },
                  { id: 'pay', label: '立即支付', variant: 'brand', onClick: () => console.log('立即支付') },
                ]}
              />
            </div>
          </div>
        </div>
      </CwCard>
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[25rem] flex-col gap-8">
      <SlotStorySection slot="headerLeft">
        <CwCard
          headerLeftSlot={
            <span className="text-sm text-[var(--text-color-secondary)]">2025-10-25</span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="headerRight">
        <CwCard
          headerRightSlot={
            <span className="px-2 py-0.5 rounded text-xs bg-[var(--success-color-light)] text-[var(--success-color-6)]">
              已完成
            </span>
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="default">
        <CwCard>
          <p className="text-sm text-[var(--text-color-primary)]">卡片正文区域示例</p>
        </CwCard>
      </SlotStorySection>
    </div>
  ),
}

export const OnlyHeader: Story = {
  render: () => (
    <div className="w-[37.5rem]">
      <CwCard
        headerLeftSlot={
          <div className="text-sm text-[var(--text-color-secondary)]">2025-10-25 10:00</div>
        }
        headerRightSlot={
          <span className="px-2 py-1 rounded text-sm font-medium bg-[var(--warning-color-light)] text-[var(--warning-color-6)]">
            待确认
          </span>
        }
      />
    </div>
  ),
}

export const OnlyBody: Story = {
  render: () => (
    <div className="w-[37.5rem]">
      <CwCard>
        <div className="text-[var(--text-color-primary)]">这是卡片内容区域</div>
      </CwCard>
    </div>
  ),
}

export const CustomContent: Story = {
  render: () => (
    <div className="w-[37.5rem]">
      <CwCard
        headerLeftSlot={
          <div className="text-sm font-semibold text-[var(--text-color-primary)]">订单编号</div>
        }
        headerRightSlot={
          <div className="text-sm text-[var(--text-color-secondary)]">#123456789</div>
        }
      >
        <div className="space-y-2">
          <div className="text-base text-[var(--text-color-primary)]">自定义内容区域</div>
          <div className="text-sm text-[var(--text-color-secondary)]">可以放置任何内容</div>
        </div>
      </CwCard>
    </div>
  ),
}

export const Collapsible: Story = {
  args: {
    collapsible: true,
    defaultExpanded: true,
  },
  render: (args) => (
    <div className="w-[37.5rem]">
      <CwCard
        {...args}
        onExpandChange={(expanded) => console.log('expand-change', expanded)}
        headerLeftSlot={
          <span className="text-base font-semibold text-[var(--text-color-primary)]">
            可折叠标题
          </span>
        }
        headerRightSlot={
          <span className="text-xs text-[var(--text-color-secondary)]">点击整行折叠</span>
        }
      >
        <div className="text-sm text-[var(--text-color-secondary)]">
          点击 header 可收起/展开此区域。折叠时 header 底部分割线会自动隐藏。
        </div>
      </CwCard>
    </div>
  ),
}

export const NoHeaderDivider: Story = {
  args: {
    showHeaderDivider: false,
  },
  render: (args) => (
    <div className="w-[37.5rem]">
      <CwCard
        {...args}
        headerLeftSlot={
          <span className="text-sm font-semibold text-[var(--text-color-primary)]">无分割线</span>
        }
      >
        <div className="text-sm text-[var(--text-color-secondary)]">
          showHeaderDivider=false 时不显示 header 下方分割线。
        </div>
      </CwCard>
    </div>
  ),
}
