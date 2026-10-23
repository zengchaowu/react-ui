import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwRow } from './CwRow'
import { CwCol } from './CwCol'
import { CwWrapRow } from './CwWrapRow'

const colClass = 'rounded p-4 text-center bg-[var(--brand-color-focus)]'

const colors = {
  brand: 'bg-[var(--button-brand-tint-hover-bg)]',
  success: 'bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)]',
  warning: 'bg-[color-mix(in_srgb,var(--warning-color-6)_15%,transparent)]',
  error: 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]',
  brandTint: 'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
}

const meta: Meta<typeof CwRow> = {
  title: '1. Components/Layout/CwRow',
  component: CwRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '珊格系统组件，提供灵活的布局解决方案。包含 CwRow 和 CwCol 两个组件，支持响应式布局、间隔设置、对齐方式等功能。',
      },
    },
  },
  argTypes: {
    gutter: {
      control: { type: 'number' },
      description: '栅格间隔',
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
    rowGap: {
      control: { type: 'number' },
      description: '行间距，当 col 换行时的行间距',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    gutter: 16,
    wrap: true,
    align: 'top',
    justify: 'start',
  },
  render: (args) => (
    <CwRow {...args}>
      <CwCol xs={6}>
        <div className={`${colors.brand} p-4 text-center rounded`}>Col 1</div>
      </CwCol>
      <CwCol xs={6}>
        <div className={`${colors.success} p-4 text-center rounded`}>Col 2</div>
      </CwCol>
      <CwCol xs={6}>
        <div className={`${colors.warning} p-4 text-center rounded`}>Col 3</div>
      </CwCol>
      <CwCol xs={6}>
        <div className={`${colors.error} p-4 text-center rounded`}>Col 4</div>
      </CwCol>
    </CwRow>
  ),
}

export const WithGutter: Story = {
  args: {
    gutter: 24,
    wrap: true,
  },
  render: (args) => (
    <CwRow {...args}>
      <CwCol xs={8}>
        <div className={`${colors.brand} p-4 text-center rounded`}>Col 1</div>
      </CwCol>
      <CwCol xs={8}>
        <div className={`${colors.success} p-4 text-center rounded`}>Col 2</div>
      </CwCol>
      <CwCol xs={8}>
        <div className={`${colors.warning} p-4 text-center rounded`}>Col 3</div>
      </CwCol>
    </CwRow>
  ),
}

export const Alignment: Story = {
  args: {
    gutter: 16,
    align: 'middle',
    justify: 'space-between',
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">垂直对齐 - {args.align}</h3>
        <CwRow {...args} className="h-20 border border-gray-300">
          <CwCol xs={6}>
            <div className={`${colors.brand} p-2 text-center rounded h-8`}>Col 1</div>
          </CwCol>
          <CwCol xs={6}>
            <div className={`${colors.success} p-2 text-center rounded h-12`}>Col 2</div>
          </CwCol>
          <CwCol xs={6}>
            <div className={`${colors.warning} p-2 text-center rounded h-16`}>Col 3</div>
          </CwCol>
          <CwCol xs={6}>
            <div className={`${colors.error} p-2 text-center rounded h-6`}>Col 4</div>
          </CwCol>
        </CwRow>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">水平排列 - {args.justify}</h3>
        <CwRow {...args} className="border border-gray-300">
          <CwCol xs={4}>
            <div className={`${colors.brand} p-2 text-center rounded`}>Col 1</div>
          </CwCol>
          <CwCol xs={4}>
            <div className={`${colors.success} p-2 text-center rounded`}>Col 2</div>
          </CwCol>
          <CwCol xs={4}>
            <div className={`${colors.warning} p-2 text-center rounded`}>Col 3</div>
          </CwCol>
        </CwRow>
      </div>
    </div>
  ),
}

export const Responsive: Story = {
  args: {
    gutter: 16,
  },
  render: (args) => (
    <CwRow {...args}>
      <CwCol xs={24} sm={12} md={8} lg={6}>
        <div className={`${colors.brand} p-4 text-center rounded`}>响应式 Col 1</div>
      </CwCol>
      <CwCol xs={24} sm={12} md={8} lg={6}>
        <div className={`${colors.success} p-4 text-center rounded`}>响应式 Col 2</div>
      </CwCol>
      <CwCol xs={24} sm={12} md={8} lg={6}>
        <div className={`${colors.warning} p-4 text-center rounded`}>响应式 Col 3</div>
      </CwCol>
      <CwCol xs={24} sm={12} md={8} lg={6}>
        <div className={`${colors.error} p-4 text-center rounded`}>响应式 Col 4</div>
      </CwCol>
    </CwRow>
  ),
}

export const OffsetAndPush: Story = {
  args: {
    gutter: 16,
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Offset 示例</h3>
        <CwRow {...args}>
          <CwCol xs={6}>
            <div className={`${colors.brand} p-4 text-center rounded`}>Col 1</div>
          </CwCol>
          <CwCol xs={{ span: 6, offset: 6 }}>
            <div className={`${colors.success} p-4 text-center rounded`}>Col 2 (offset 6)</div>
          </CwCol>
          <CwCol xs={6}>
            <div className={`${colors.warning} p-4 text-center rounded`}>Col 3</div>
          </CwCol>
        </CwRow>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Push 和 Pull 示例</h3>
        <CwRow {...args}>
          <CwCol xs={{ span: 6, push: 6 }}>
            <div className={`${colors.brand} p-4 text-center rounded`}>Col 1 (push 6)</div>
          </CwCol>
          <CwCol xs={{ span: 6, pull: 6 }}>
            <div className={`${colors.success} p-4 text-center rounded`}>Col 2 (pull 6)</div>
          </CwCol>
        </CwRow>
      </div>
    </div>
  ),
}

export const WithRowGap: Story = {
  args: {
    gutter: 16,
    wrap: true,
    rowGap: 20,
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">行间距示例 - rowGap: {args.rowGap}px</h3>
        <CwRow {...args}>
          <CwCol xs={8}>
            <div className={`${colors.brand} p-4 text-center rounded`}>Col 1</div>
          </CwCol>
          <CwCol xs={8}>
            <div className={`${colors.success} p-4 text-center rounded`}>Col 2</div>
          </CwCol>
          <CwCol xs={8}>
            <div className={`${colors.warning} p-4 text-center rounded`}>Col 3</div>
          </CwCol>
          <CwCol xs={8}>
            <div className={`${colors.error} p-4 text-center rounded`}>Col 4</div>
          </CwCol>
          <CwCol xs={8}>
            <div className={`${colors.brandTint} p-4 text-center rounded`}>Col 5</div>
          </CwCol>
          <CwCol xs={8}>
            <div className={`${colors.error} p-4 text-center rounded`}>Col 6</div>
          </CwCol>
        </CwRow>
      </div>
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="default">
      <CwRow gutter={16} wrap>
        <CwCol xs={8}>
          <div className="rounded border border-[var(--brand-color-6)] bg-[var(--bg-color-container)] p-4 text-center text-sm text-[var(--brand-color-6)]">
            CwCol 自定义内容 1
          </div>
        </CwCol>
        <CwCol xs={8}>
          <div className="rounded bg-[var(--brand-color-6)] p-4 text-center text-sm text-[var(--text-color-anti)]">
            CwCol 自定义内容 2
          </div>
        </CwCol>
        <CwCol xs={8}>
          <div className="rounded bg-[var(--bg-color-secondarycontainer)] p-4 text-center text-sm text-[var(--text-color-secondary)]">
            CwCol 自定义内容 3
          </div>
        </CwCol>
      </CwRow>
    </SlotStorySection>
  ),
}

