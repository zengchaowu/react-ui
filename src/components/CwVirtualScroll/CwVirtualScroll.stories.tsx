import type { Meta, StoryObj } from '@storybook/react'
import { CwVirtualScroll } from './CwVirtualScroll'
import type { CwVirtualScrollItem } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwVirtualScroll> = {
  title: '1. Components/Layout/CwVirtualScroll',
  component: CwVirtualScroll,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '虚拟滚动：只渲染可见项。滚动基于 CwDiv；默认隐藏滚动条，showScrollbar 时可常显。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    itemHeight: {
      control: { type: 'number' },
      description: '默认项目高度（像素）',
    },
    itemWidth: {
      control: { type: 'number' },
      description: '默认项目宽度（像素）',
    },
    bufferSize: {
      control: { type: 'number' },
      description: '可见区域缓冲数量',
    },
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal', 'both'],
      description: '滚动方向',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    showScrollbar: {
      control: { type: 'boolean' },
      description: '是否显示滚动条',
    },
    padding: {
      control: { type: 'object' },
      description: '内边距（像素），可以是单个值或对象 { top, right, bottom, left }',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwVirtualScroll>

const MILLION = 1_000_000

const generateItems = (count: number): CwVirtualScrollItem[] => {
  const items = new Array<CwVirtualScrollItem>(count)
  for (let i = 0; i < count; i++) {
    items[i] = { key: i, data: { id: i } }
  }
  return items
}

const generateLabeledItems = (count: number): CwVirtualScrollItem[] => {
  const items = new Array<CwVirtualScrollItem>(count)
  for (let i = 0; i < count; i++) {
    items[i] = {
      key: i,
      data: {
        id: i,
        title: `项目 ${i + 1}`,
        description: `这是第 ${i + 1} 个项目的描述内容`,
      },
    }
  }
  return items
}

type DemoData = { title: string; description: string }

export const Default: Story = {
  render: () => (
    <div className="h-[100dvh] w-full">
      <CwVirtualScroll items={generateLabeledItems(1000)} itemHeight={60} bufferSize={8} showScrollbar>
        {({ item, index }) => {
          const data = item as DemoData
          return (
            <div className="box-border flex h-full flex-col justify-center border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-4">
              <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
              <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
                索引: {index} / 1000
              </div>
            </div>
          )
        }}
      </CwVirtualScroll>
    </div>
  ),
}

export const LargeDataset: Story = {
  args: {
    itemHeight: 60,
    bufferSize: 12,
    showScrollbar: true,
  },
  render: (args) => {
    const items = generateItems(MILLION)
    return (
      <div className="relative w-[100vw] h-[100vh] bg-[var(--bg-color-container)]">
        <CwVirtualScroll {...args} items={items}>
          {({ index }) => (
            <div className="box-border flex h-full flex-col justify-center px-4 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="font-medium text-[var(--text-color-primary)]">
                项目 {index + 1}
              </div>
              <div className="text-xs text-[var(--text-color-secondary)] mt-1">
                索引: {index} / {items.length}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

type VariableItemData = { id: number; title: string; lines: number }

export const VariableHeight: Story = {
  args: {
    itemHeight: 60,
    bufferSize: 3,
  },
  render: (args) => {
    const items: CwVirtualScrollItem<VariableItemData>[] = Array.from(
      { length: 100 },
      (_, index) => {
        const lines = (index % 5) + 1
        const paddingY = 24 // py-3 * 2
        const titleH = 24
        const gap = 8 // mt-2
        const lineH = 20
        return {
          key: `item-${index}`,
          data: {
            id: index,
            title: `项目 ${index + 1}`,
            lines,
          },
          height: paddingY + titleH + gap + lines * lineH,
        }
      },
    )
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => (
            <div className="box-border h-full overflow-hidden px-4 py-3 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="h-6 leading-6 font-medium text-[var(--text-color-primary)]">
                {item.title}
              </div>
              <div className="mt-2">
                {Array.from({ length: item.lines }, (_, i) => i + 1).map((line) => (
                  <div
                    key={line}
                    className="h-5 leading-5 text-sm text-[var(--text-color-secondary)]"
                  >
                    这是第 {line} 行内容
                  </div>
                ))}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    itemHeight: 80,
    disabled: true,
  },
  render: (args) => {
    const items = generateLabeledItems(100)
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => {
            const data = item as DemoData
            return (
              <div className="px-4 py-3 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
                <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
                <div className="text-sm text-[var(--text-color-secondary)] mt-1">
                  {data.description}
                </div>
              </div>
            )
          }}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const Readonly: Story = {
  args: {
    itemHeight: 80,
    readonly: true,
  },
  render: (args) => {
    const items = generateLabeledItems(100)
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => {
            const data = item as DemoData
            return (
              <div className="px-4 py-3 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
                <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
                <div className="text-sm text-[var(--text-color-secondary)] mt-1">
                  {data.description}
                </div>
              </div>
            )
          }}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const Empty: Story = {
  args: {
    itemHeight: 80,
  },
  render: (args) => {
    const items: CwVirtualScrollItem[] = []
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => {
            const data = item as DemoData
            return (
              <div className="px-4 py-3 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
                <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
              </div>
            )
          }}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const WithScrollbarLargeDataset: Story = {
  args: {
    itemHeight: 60,
    bufferSize: 12,
    showScrollbar: true,
  },
  render: (args) => {
    const items = generateItems(MILLION)
    return (
      <div className="relative w-[100vw] h-[100vh] bg-[var(--bg-color-container)]">
        <CwVirtualScroll {...args} items={items}>
          {({ index }) => (
            <div className="box-border flex h-full flex-col justify-center px-4 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="font-medium text-[var(--text-color-primary)]">
                项目 {index + 1}
              </div>
              <div className="text-xs text-[var(--text-color-secondary)] mt-1">
                索引: {index} / {items.length}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const HorizontalWithScrollbar: Story = {
  args: {
    direction: 'horizontal',
    itemWidth: 200,
    itemHeight: 150,
    bufferSize: 2,
    showScrollbar: true,
  },
  render: (args) => {
    const items: CwVirtualScrollItem<DemoData>[] = Array.from(
      { length: 100 },
      (_, index) => ({
        key: `item-${index}`,
        data: {
          id: index,
          title: `卡片 ${index + 1}`,
          description: `这是第 ${index + 1} 个卡片`,
        },
      }),
    )
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => (
            <div className="mx-2 h-full flex flex-col justify-center items-center border border-[var(--border-color)] rounded-lg bg-[var(--bg-color-container)] shadow-sm">
              <div className="font-medium text-[var(--text-color-primary)] text-center">
                {item.title}
              </div>
              <div className="text-sm text-[var(--text-color-secondary)] mt-2 text-center px-4">
                {item.description}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const BothDirectionWithScrollbar: Story = {
  args: {
    direction: 'both',
    itemWidth: 1300,
    itemHeight: 100,
    bufferSize: 2,
    showScrollbar: true,
  },
  render: (args) => {
    const items: CwVirtualScrollItem<DemoData>[] = Array.from(
      { length: 5000 },
      (_, index) => ({
        key: `item-${index}`,
        data: {
          id: index,
          title: `项目 ${index + 1}`,
          description: `这是第 ${index + 1} 个项目，支持双向滚动`,
        },
      }),
    )
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => (
            <div className="m-2 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color-container)] shadow-sm">
              <div className="font-medium text-[var(--text-color-primary)]">{item.title}</div>
              <div className="text-sm text-[var(--text-color-secondary)] mt-2">
                {item.description}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const WithPadding: Story = {
  args: {
    itemHeight: 80,
    bufferSize: 3,
    showScrollbar: true,
    padding: 20,
  },
  render: (args) => {
    const items = generateLabeledItems(50)
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => {
            const data = item as DemoData
            return (
              <div className="px-4 py-3 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)] hover:bg-[var(--bg-color-component-hover)] transition-colors">
                <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
                <div className="text-sm text-[var(--text-color-secondary)] mt-1">
                  {data.description}
                </div>
              </div>
            )
          }}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const HorizontalWithPadding: Story = {
  args: {
    direction: 'horizontal',
    itemWidth: 200,
    bufferSize: 3,
    showScrollbar: true,
    padding: 16,
  },
  render: (args) => {
    const items: CwVirtualScrollItem<DemoData>[] = Array.from(
      { length: 30 },
      (_, index) => ({
        key: `item-${index}`,
        data: {
          id: index,
          title: `项目 ${index + 1}`,
          description: `这是第 ${index + 1} 个项目`,
        },
      }),
    )
    return (
      <div className="relative w-[100vw] h-[100vh]">
        <CwVirtualScroll {...args} items={items}>
          {({ item }) => (
            <div className="h-full px-4 py-3 hairline-border-r border-[var(--border-color)] bg-[var(--bg-color-container)] hover:bg-[var(--bg-color-component-hover)] transition-colors flex flex-col justify-center">
              <div className="font-medium text-[var(--text-color-primary)]">{item.title}</div>
              <div className="text-sm text-[var(--text-color-secondary)] mt-1">
                {item.description}
              </div>
            </div>
          )}
        </CwVirtualScroll>
      </div>
    )
  },
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => {
    const defaultItems = generateLabeledItems(8)
    const emptyItems: CwVirtualScrollItem[] = []
    const scrollArgs = { itemHeight: 72, bufferSize: 3 }
    return (
      <div className="flex flex-col gap-10">
        <SlotStorySection slot="default">
          <div className="relative h-[17.5rem] w-[22.5rem] border border-[var(--border-color)] rounded-lg">
            <CwVirtualScroll {...scrollArgs} items={defaultItems}>
              {({ item, index }) => {
                const data = item as DemoData
                return (
                  <div className="hairline-border-b border-[var(--border-color)] bg-[var(--brand-color-focus)] px-4 py-3">
                    <div className="text-sm font-medium text-[var(--text-color-anti)]">
                      {data.title}（#{index}）
                    </div>
                  </div>
                )
              }}
            </CwVirtualScroll>
          </div>
        </SlotStorySection>
        <SlotStorySection slot="empty">
          <div className="relative h-[12.5rem] w-[22.5rem] border border-[var(--border-color)] rounded-lg">
            <CwVirtualScroll
              {...scrollArgs}
              items={emptyItems}
              emptySlot={
                <div className="flex h-full items-center justify-center text-sm text-[var(--text-color-secondary)]">
                  自定义空状态
                </div>
              }
            />
          </div>
        </SlotStorySection>
      </div>
    )
  },
}
