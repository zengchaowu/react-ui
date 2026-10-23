import type { Meta, StoryObj } from '@storybook/react'
import { CwGrid } from './CwGrid'
import type { CwGridProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const itemClass = 'rounded p-4 text-center'
const itemBackgrounds = [
  'bg-[var(--button-brand-tint-active-bg)]',
  'bg-[var(--brand-color-focus)]',
  'bg-[var(--brand-color-disabled)]',
  'bg-[var(--brand-color-special)]',
  'bg-[var(--brand-color-hover)]',
  'bg-[var(--brand-color-6)]',
  'bg-[var(--brand-color-active)]',
]

function items(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} className={`${itemClass} ${itemBackgrounds[index % itemBackgrounds.length]}`}>
      Item {index + 1}
    </div>
  ))
}

const meta: Meta<typeof CwGrid> = {
  title: '1. Components/Layout/CwGrid',
  component: CwGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Grid 布局组件，基于 CwRow 和 CwCol 实现，提供简化的网格布局 API。支持响应式布局、列数配置、间距设置等功能。',
      },
    },
  },
  argTypes: {
    columns: {
      control: { type: 'number', min: 1, max: 24 },
      description: '默认列数（1-24），用于所有断点，除非在 breakpoints 中覆盖',
    },
    gutter: {
      control: { type: 'number' },
      description: '栅格间隔',
    },
    rowGap: {
      control: { type: 'number' },
      description: '行间距，当项目换行时的行间距',
    },
    wrap: {
      control: { type: 'boolean' },
      description: '是否换行',
    },
    align: {
      control: { type: 'select' },
      options: ['top', 'middle', 'bottom', 'stretch'],
      description: '垂直对齐方式',
    },
    justify: {
      control: { type: 'select' },
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      description: '水平排列方式',
    },
    flushStart: {
      control: { type: 'boolean' },
      description: '首列贴左（类似 CwTabsStrip tabFlushStart）',
    },
    flushEnd: {
      control: { type: 'boolean' },
      description: '末列贴右（类似 CwTabsStrip tabFlushEnd）',
    },
    measure: {
      control: { type: 'boolean' },
      description: '是否实测容器宽（虚拟列表行内可关以跳过 ResizeObserver）',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CwGrid>

export const Default: Story = {
  args: {
    columns: 3,
    gutter: 16,
    wrap: true,
    align: 'top',
    justify: 'start',
  },
  render: (args) => <CwGrid {...args}>{items(6)}</CwGrid>,
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
    gutter: 16,
  },
  render: (args) => <CwGrid {...args}>{items(4)}</CwGrid>,
}

export const FourColumns: Story = {
  args: {
    columns: 4,
    gutter: 16,
  },
  render: (args) => <CwGrid {...args}>{items(8)}</CwGrid>,
}

export const FlushEdges: Story = {
  args: {
    columns: 6,
    gutter: 12,
    flushStart: true,
    flushEnd: true,
  },
  render: (args) => (
    <div className="max-w-[22.5rem] rounded-lg border border-[var(--border-color)] px-4 py-3">
      <p className="mb-3 text-xs text-[var(--text-color-secondary)]">
        flushStart + flushEnd：首列左对齐、末列右对齐，列间距仅出现在列与列之间
      </p>
      <CwGrid {...args}>
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-10 w-10 rounded bg-[var(--button-brand-tint-active-bg)] text-center text-xs leading-10"
          >
            {index + 1}
          </div>
        ))}
      </CwGrid>
    </div>
  ),
}

export const WithGutter: Story = {
  args: {
    columns: 2,
    gutter: 24,
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Gutter: {args.gutter}px</h3>
        <CwGrid {...args}>{items(4)}</CwGrid>
      </div>
    </div>
  ),
}

export const WithRowGap: Story = {
  args: {
    columns: 3,
    gutter: 16,
    rowGap: 20,
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Row Gap: {args.rowGap}px</h3>
        <CwGrid {...args}>{items(6)}</CwGrid>
      </div>
    </div>
  ),
}

const alignmentItems = [
  'py-2',
  'py-4',
  'py-6',
  'py-3',
].map((padding, index) => (
  <div
    key={index}
    className={`flex items-center justify-center rounded ${itemBackgrounds[index]} px-2 ${padding} text-center leading-6`}
  >
    Item {index + 1}
  </div>
))

export const Alignment: Story = {
  args: {
    columns: 3,
    gutter: 16,
    align: 'middle',
    justify: 'space-between',
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">垂直对齐 - {args.align}</h3>
        <CwGrid {...args} className="border border-[var(--border-color)] p-4">
          {alignmentItems}
        </CwGrid>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">水平排列 - {args.justify}</h3>
        <CwGrid {...args} className="border border-[var(--border-color)] p-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={`${itemBackgrounds[index]} p-2 text-center rounded`}>
              Item {index + 1}
            </div>
          ))}
        </CwGrid>
      </div>
    </div>
  ),
}

export const Responsive: Story = {
  args: {
    columns: 3,
    gutter: 16,
    breakpoints: {
      xs: { columns: 1 },
      sm: { columns: 2 },
      md: { columns: 3 },
      lg: { columns: 4 },
      xl: { columns: 6 },
    },
  },
  render: (args) => <CwGrid {...args}>{items(6)}</CwGrid>,
}

const slotGridArgs: CwGridProps = { columns: 3, gutter: 16, wrap: true }

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="default">
      <CwGrid {...slotGridArgs}>
        <div className="rounded border border-dashed border-[var(--brand-color-6)] bg-[var(--button-brand-tint-active-bg)] p-4 text-center text-sm text-[var(--brand-color-6)]">
          自定义列内容 A
        </div>
        <div className="rounded bg-[var(--brand-color-focus)] p-4 text-center text-sm text-[var(--text-color-anti)]">
          自定义列内容 B
        </div>
        <div className="rounded bg-[var(--brand-color-disabled)] p-4 text-center text-sm">
          自定义列内容 C
        </div>
      </CwGrid>
    </SlotStorySection>
  ),
}
