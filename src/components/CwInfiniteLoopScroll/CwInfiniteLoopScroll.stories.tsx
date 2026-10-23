import type { Meta, StoryObj } from '@storybook/react'
import {
  CwInfiniteLoopScroll,
  type CwInfiniteLoopScrollComponentProps,
} from './CwInfiniteLoopScroll'
import type { CwInfiniteLoopScrollItem } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { numberControlArgType } from '../../storybook/argTypes'

const meta: Meta<typeof CwInfiniteLoopScroll> = {
  title: '1. Components/Layout/CwInfiniteLoopScroll',
  component: CwInfiniteLoopScroll,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '无限循环滚动。自由滚动基于 CwDiv；默认显示滚动条。分页吸附仍用手势平移。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
    },
    itemHeight: numberControlArgType({
      description: '单项未设 height 时的默认行高（px）',
    }),
    itemWidth: numberControlArgType({
      description: '单项未设 width 时的默认列宽（px）',
    }),
    direction: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal', 'both'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    enableMomentum: {
      control: { type: 'boolean' },
    },
    bufferSize: numberControlArgType(),
    pageWidth: numberControlArgType({
      min: 0,
      step: 1,
      description: '分页吸附页宽：number 为 px；string 可为相对值如 1/3',
    }),
    pageHeight: numberControlArgType({
      min: 0,
      step: 1,
      description: '分页吸附页高：number 为 px；string 可为相对值如 1/3',
    }),
    snapThreshold: numberControlArgType({
      min: 0,
      max: 1,
      step: 0.01,
      description: '分页吸附阈值（0–1）',
    }),
    showScrollbar: {
      control: { type: 'boolean' },
      description: '是否常显 CwDiv 滚动条（默认 true）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwInfiniteLoopScroll>

/** 不写 height/width，让 Controls 的 itemHeight / itemWidth 作为默认值生效 */
const generateItems = (count: number): CwInfiniteLoopScrollItem[] =>
  Array.from({ length: count }, (_, i) => ({
    key: i,
    data: {
      id: i,
      title: `项目 ${i + 1}`,
      content: `这是第 ${i + 1} 个项目的内容`,
    },
  }))

function renderVertical(args: CwInfiniteLoopScrollComponentProps) {
  return (
    <div
      style={{ width: 400, height: 600 }}
      className="border border-[var(--border-color)] bg-[var(--bg-color-container)]"
    >
      <CwInfiniteLoopScroll {...args}>
        {({ item }) => {
          const data = item as { title: string; content: string }
          return (
            <div className="box-border flex h-full flex-col justify-center overflow-hidden p-4 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
              <div className="text-sm text-[var(--text-color-secondary)]">{data.content}</div>
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  )
}

function renderHorizontal(args: CwInfiniteLoopScrollComponentProps) {
  return (
    <div
      style={{ width: 600, height: 200 }}
      className="border border-[var(--border-color)] bg-[var(--bg-color-container)]"
    >
      <CwInfiniteLoopScroll {...args}>
        {({ item }) => {
          const data = item as { title: string }
          return (
            <div className="flex h-full items-center justify-center p-4 hairline-border-r border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  )
}

function WithSlotsDemo() {
  const defaultItems = generateItems(5)
  const loopArgs: Omit<CwInfiniteLoopScrollComponentProps, 'items'> = {
    itemHeight: 80,
    direction: 'vertical',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 3,
  }
  const emptyArgs: CwInfiniteLoopScrollComponentProps = { ...loopArgs, items: [] }
  return (
    <div className="flex flex-col gap-10">
      <SlotStorySection slot="default">
        <div className="h-[20rem] w-[22.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]">
          <CwInfiniteLoopScroll {...loopArgs} items={defaultItems}>
            {({ item }) => {
              const data = item as { title: string }
              return (
                <div className="hairline-border-b border-[var(--border-color)] bg-[var(--brand-color-focus)] p-4">
                  <div className="text-sm font-medium text-[var(--text-color-anti)]">
                    {data.title}（自定义行）
                  </div>
                </div>
              )
            }}
          </CwInfiniteLoopScroll>
        </div>
      </SlotStorySection>
      <SlotStorySection slot="empty">
        <div className="h-[12.5rem] w-[22.5rem] rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]">
          <CwInfiniteLoopScroll
            {...emptyArgs}
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
}

export const Default: Story = {
  args: {
    items: generateItems(20),
    itemHeight: 80,
    direction: 'vertical',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 3,
    showScrollbar: true,
  },
  render: (args) => renderVertical(args as CwInfiniteLoopScrollComponentProps),
}

/** 关闭滚动条（默认开启） */
export const HideScrollbar: Story = {
  args: {
    ...Default.args,
    showScrollbar: false,
  },
  render: Default.render,
}

export const Horizontal: Story = {
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({
      key: i,
      data: {
        id: i,
        title: `项目 ${i + 1}`,
      },
    })),
    itemWidth: 200,
    direction: 'horizontal',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 5,
    showScrollbar: true,
  },
  render: (args) => renderHorizontal(args as CwInfiniteLoopScrollComponentProps),
}

export const Both: Story = {
  args: {
    items: Array.from({ length: 20 }, (_, i) => ({
      key: i,
      data: {
        id: i,
        title: `项目 ${i + 1}`,
        content: '横向可拖动查看更宽内容 · '.repeat(4),
      },
      height: 100,
      width: 720,
    })),
    itemHeight: 100,
    itemWidth: 720,
    direction: 'both',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 3,
    showScrollbar: true,
  },
  render: (args) => (
    <div className="h-[25rem] w-[31.25rem] border border-[var(--border-color)] bg-[var(--bg-color-container)]">
      <CwInfiniteLoopScroll {...(args as CwInfiniteLoopScrollComponentProps)}>
        {({ item }) => {
          const data = item as { title: string; content: string }
          return (
            <div className="flex h-full items-center gap-4 border border-[var(--border-color)] bg-[var(--bg-color-container)] px-4">
              <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
              <div className="truncate text-sm text-[var(--text-color-secondary)]">
                {data.content}
              </div>
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  ),
}

export const VariableHeight: Story = {
  args: {
    // height 必须盖住 slot 内容；随机 height + 随机行数会对不齐，看起来像「显示不全」
    items: Array.from({ length: 30 }, (_, i) => {
      const lines = (i % 5) + 1
      const paddingY = 32 // p-4 * 2
      const titleH = 24
      const lineH = 20
      return {
        key: i,
        data: {
          id: i,
          title: `项目 ${i + 1}`,
          lines,
        },
        height: paddingY + titleH + lines * lineH,
      }
    }),
    itemHeight: 80,
    direction: 'vertical',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 3,
  },
  render: (args) => (
    <div
      style={{ width: 400, height: 600 }}
      className="border border-[var(--border-color)] bg-[var(--bg-color-container)]"
    >
      <CwInfiniteLoopScroll {...(args as CwInfiniteLoopScrollComponentProps)}>
        {({ item }) => {
          const data = item as { title: string; lines: number }
          return (
            <div className="box-border h-full overflow-hidden p-4 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="h-6 leading-6 font-medium text-[var(--text-color-primary)]">
                {data.title}
              </div>
              {Array.from({ length: data.lines }, (_, line) => (
                <div
                  key={line}
                  className="h-5 leading-5 text-sm text-[var(--text-color-secondary)]"
                >
                  这是第 {line + 1} 行内容
                </div>
              ))}
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: Default.render,
}

export const Readonly: Story = {
  args: {
    ...Default.args,
    readonly: true,
  },
  render: Default.render,
}

export const VerticalWithPadding: Story = {
  args: {
    ...Default.args,
    items: generateItems(30),
    bufferSize: 5,
    padding: {
      top: 300 - 40,
      bottom: 300 - 40,
    },
  },
  render: Default.render,
}

export const HorizontalWithPadding: Story = {
  args: {
    items: Array.from({ length: 20 }, (_, i) => ({
      key: i,
      data: {
        id: i,
        title: `项目 ${i + 1}`,
      },
    })),
    itemWidth: 200,
    direction: 'horizontal',
    disabled: false,
    readonly: false,
    enableMomentum: true,
    bufferSize: 3,
    snapToPage: true,
    snapThreshold: 0.33,
    pageWidth: 200,
    padding: {
      left: 300 - 100,
      right: 300 - 100,
    },
  },
  render: (args) => (
    <div
      style={{ width: 600, height: 200 }}
      className="border border-[var(--border-color)] bg-[var(--bg-color-container)]"
    >
      <CwInfiniteLoopScroll {...(args as CwInfiniteLoopScrollComponentProps)}>
        {({ item }) => {
          const data = item as { title: string }
          return (
            <div className="flex h-full items-center justify-center px-4 hairline-border-r border-[var(--border-color)] bg-[var(--bg-color-container)]">
              <div className="font-medium text-[var(--text-color-primary)]">{data.title}</div>
            </div>
          )
        }}
      </CwInfiniteLoopScroll>
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}
