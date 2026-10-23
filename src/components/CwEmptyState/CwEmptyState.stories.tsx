import type { Meta, StoryObj } from '@storybook/react'
import { CwEmptyState } from './CwEmptyState'
import { CwButton } from '../CwButton'
import { CwIcon } from '../CwIcon'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwEmptyState> = {
  title: '1. Components/Display/CwEmptyState',
  component: CwEmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'CwEmptyState 用于展示空状态，通常用于列表为空、搜索无结果等场景。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '尺寸大小',
    },
    showText: {
      control: { type: 'boolean' },
      description: '是否显示文本',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwEmptyState>

const storyFrameClass =
  'w-[22rem] rounded-[var(--radius-default)] border border-[var(--border-color)] bg-[var(--bg-color-container)]'

export const Default: Story = {
  render: (args) => (
    <div className={storyFrameClass}>
      <CwEmptyState {...args} />
    </div>
  ),
}

export const NoText: Story = {
  name: '仅图标（showText=false）',
  parameters: {
    docs: {
      description: {
        story:
          '关闭文案后需自行提供 #icon 或 #action，否则组件内部没有任何可见内容。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-[var(--text-color-secondary)]">showText=false，仅展示 #icon</p>
      <div className={storyFrameClass}>
        <CwEmptyState
          {...args}
          icon={
            <CwIcon
              name="common--status--empty-line"
              prefix="icon"
              size={3}
              className="text-[var(--text-color-placeholder)]"
            />
          }
        />
      </div>
    </div>
  ),
  args: {
    showText: false,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-[var(--text-color-secondary)]">Small</div>
        <div className={storyFrameClass}>
          <CwEmptyState size="small" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-[var(--text-color-secondary)]">Medium</div>
        <div className={storyFrameClass}>
          <CwEmptyState size="medium" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-medium text-[var(--text-color-secondary)]">Large</div>
        <div className={storyFrameClass}>
          <CwEmptyState size="large" />
        </div>
      </div>
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex flex-col gap-10 items-center">
      <SlotStorySection slot="icon">
        <CwEmptyState
          icon={
            <CwIcon
              name="common--status--empty-line"
              prefix="icon"
              size={3}
              className="text-[var(--text-color-placeholder)]"
            />
          }
        />
      </SlotStorySection>
      <SlotStorySection slot="text">
        <CwEmptyState
          text={<span className="text-sm text-[var(--text-color-secondary)]">暂无相关数据</span>}
        />
      </SlotStorySection>
      <SlotStorySection slot="action">
        <CwEmptyState
          action={
            <CwButton type="primary" size="medium">
              刷新
            </CwButton>
          }
        />
      </SlotStorySection>
    </div>
  ),
}
