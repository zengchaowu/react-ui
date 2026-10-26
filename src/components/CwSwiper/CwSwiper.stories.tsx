import type { Meta, StoryObj } from '@storybook/react'
import { CwSwiper } from './CwSwiper'
import type { CwSwiperItem, CwSwiperItemSlotProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { storybookPlaceholderImage } from '../../storybook/placeholderImage'

const meta: Meta<typeof CwSwiper> = {
  title: '1. Components/Media/CwSwiper',
  component: CwSwiper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '支持缩放效果的轮播组件，基于 CwInfiniteLoopScroll 实现，支持水平无限循环滚动、缩放效果、分页模式、惯性滚动等功能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: '数据列表',
    },
    itemWidth: {
      control: { type: 'number' },
      description: '默认项目宽度（像素）',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    enableMomentum: {
      control: { type: 'boolean' },
      description: '是否启用滚动惯性',
    },
    momentumDeceleration: {
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      description: '惯性减速度（0-1）',
    },
    snapToPage: {
      control: { type: 'boolean' },
      description: '是否启用分页模式',
    },
    snapThreshold: {
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      description: '分页阈值（0-1）',
    },
    minScale: {
      control: { type: 'number', min: 0, max: 1, step: 0.01 },
      description: '最小缩放比例（0-1）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwSwiper>

// 生成测试数据
const generateItems = (count: number): CwSwiperItem[] =>
  Array.from({ length: count }, (_, i) => ({
    key: i,
    data: {
      id: i,
      title: `项目 ${i + 1}`,
      content: `这是第 ${i + 1} 个项目的内容`,
    },
    image: storybookPlaceholderImage(300, 200, i),
  }))

// 生成纯文本数据
const generateTextItems = (count: number): CwSwiperItem[] =>
  Array.from({ length: count }, (_, i) => ({
    key: i,
    data: {
      id: i,
      title: `项目 ${i + 1}`,
      content: `这是第 ${i + 1} 个项目的内容`,
    },
  }))

export const Default: Story = {
  args: {
    items: generateItems(10),
    itemWidth: 300,
    disabled: false,
    readonly: false,
    enableMomentum: false,
    momentumDeceleration: 0.95,
    snapToPage: true,
    snapThreshold: 0.33,
    minScale: 0.9,
  },
  render: (args) => (
    <div className="relative h-[100vh] w-[100vw]">
      <CwSwiper {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    items: generateItems(10),
    itemWidth: 300,
    disabled: true,
    readonly: false,
    enableMomentum: false,
    momentumDeceleration: 0.95,
    snapToPage: true,
    snapThreshold: 0.33,
    minScale: 0.9,
  },
  render: (args) => (
    <div className="relative h-[100vh] w-[100vw]">
      <CwSwiper {...args} />
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    items: generateTextItems(6),
    itemWidth: 200,
    enableMomentum: true,
    snapToPage: true,
    snapThreshold: 0.33,
    minScale: 0.88,
  },
  render: (args) => (
    <SlotStorySection slot="default">
      <div className="relative h-[12.5rem] w-full max-w-[40rem] border border-[var(--border-color)]">
        <CwSwiper
          {...args}
          children={({ item, index }: CwSwiperItemSlotProps) => {
            const data = item.data as { title?: string }
            return (
              <div className="flex h-[7.5rem] w-full flex-col items-center justify-center rounded-lg bg-[var(--button-brand-tint-hover-bg)] px-4">
                <span className="text-sm font-semibold text-[var(--brand-color-6)]">
                  {data.title}
                </span>
                <span className="mt-1 text-xs text-[var(--text-color-secondary)]">
                  #{index + 1} 自定义项
                </span>
              </div>
            )
          }}
        />
      </div>
    </SlotStorySection>
  ),
}

export const Readonly: Story = {
  args: {
    items: generateItems(10),
    itemWidth: 300,
    disabled: false,
    readonly: true,
    enableMomentum: false,
    momentumDeceleration: 0.95,
    snapToPage: true,
    snapThreshold: 0.33,
    minScale: 0.9,
  },
  render: (args) => (
    <div className="relative h-[100vh] w-[100vw]">
      <CwSwiper {...args} />
    </div>
  ),
}
