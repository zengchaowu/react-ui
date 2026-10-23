import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwWrapRow } from './CwWrapRow'
import type { CwWrapRowInstance } from './CwWrapRow'
import { CwCol } from './CwCol'

const items = [
  { id: 1, text: 'Item 1', color: 'bg-[var(--button-brand-tint-hover-bg)]' },
  { id: 2, text: 'Item 2', color: 'bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)]' },
  { id: 3, text: 'Item 3', color: 'bg-[color-mix(in_srgb,var(--warning-color-6)_15%,transparent)]' },
  { id: 4, text: 'Item 4', color: 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]' },
  { id: 5, text: 'Item 5', color: 'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]' },
  { id: 6, text: 'Item 6', color: 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]' },
  { id: 7, text: 'Item 7', color: 'bg-[var(--button-brand-tint-hover-bg)]' },
  { id: 8, text: 'Item 8', color: 'bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)]' },
  { id: 9, text: 'Item 9', color: 'bg-[color-mix(in_srgb,var(--warning-color-6)_15%,transparent)]' },
  { id: 10, text: 'Item 10', color: 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]' },
  { id: 11, text: 'Item 11', color: 'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]' },
  { id: 12, text: 'Item 12', color: 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]' },
]

const meta: Meta<typeof CwWrapRow> = {
  title: '1. Components/Layout/CwWrapRow',
  component: CwWrapRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'CwWrapRow 是一个包装组件，基于 CwRow 实现，支持最大行数限制和统一的列属性配置。',
      },
    },
  },
  argTypes: {
    wrap: {
      control: { type: 'boolean' },
      description: '是否换行',
    },
    maxRows: {
      control: { type: 'number' },
      description: '最大行数',
    },
    colPros: {
      control: { type: 'object' },
      description: '所有 col 的 props 配置',
    },
  },
  args: {
    wrap: true,
    maxRows: 2,
    colPros: {
      xs: 12,
      sm: 8,
      md: 6,
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function ControlsDemo() {
  return (
    <div className="rounded border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-color-secondarycomponent)] p-4 text-center">
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer rounded bg-[var(--brand-color-6)] px-4 py-2 text-[var(--text-color-anti)] hover:opacity-90"
      >
        查看更多
      </div>
    </div>
  )
}

const fallbackArgs = {
  wrap: true as const,
  maxRows: 2,
  colPros: { xs: 12, sm: 8, md: 6 },
}

function CollapsedStateDemo(args: Story['args']) {
  const wrapRowRef = useRef<CwWrapRowInstance>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsCollapsed(wrapRowRef.current?.isChildrenCollapsed ?? false)
  }, [args])

  const xs = args?.colPros?.xs
  const xsSpan = typeof xs === 'number' ? xs : xs?.span || 24
  const itemsPerRow = Math.floor(24 / xsSpan)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-[var(--bg-color-component)] p-4">
        <h3 className="mb-2 text-lg font-semibold">折叠状态监控</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[var(--text-color-secondary)]">是否有子元素被折叠：</span>
          <span
            className={[
              'rounded-full px-3 py-1 text-sm font-medium',
              isCollapsed
                ? 'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] text-[var(--error-color-active)]'
                : 'bg-[color-mix(in_srgb,var(--success-color-6)_12%,transparent)] text-[var(--success-color-active)]',
            ].join(' ')}
          >
            {isCollapsed ? '是' : '否'}
          </span>
        </div>
        <div className="mt-2 text-xs text-[var(--text-color-placeholder)]">
          当前最大行数：{args?.maxRows}，每行元素数：{itemsPerRow}
        </div>
      </div>

      <CwWrapRow ref={wrapRowRef} {...fallbackArgs} {...args}>
        {items.map((item) => (
          <CwCol key={item.id} {...(args?.colPros ?? fallbackArgs.colPros)}>
            <div className={[item.color, 'rounded p-4 text-center'].join(' ')}>{item.text}</div>
          </CwCol>
        ))}
      </CwWrapRow>
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <CwWrapRow {...fallbackArgs} {...args}>
      {items.map((item) => (
        <CwCol key={item.id} {...(args.colPros ?? fallbackArgs.colPros)}>
          <div className={[item.color, 'rounded p-4 text-center'].join(' ')}>{item.text}</div>
        </CwCol>
      ))}
    </CwWrapRow>
  ),
}

export const WithControls: Story = {
  render: (args) => (
    <CwWrapRow {...fallbackArgs} {...args} controlsSlot={<ControlsDemo />}>
      {items.map((item) => (
        <CwCol key={item.id} {...(args.colPros ?? fallbackArgs.colPros)}>
          <div className={[item.color, 'rounded p-4 text-center'].join(' ')}>{item.text}</div>
        </CwCol>
      ))}
    </CwWrapRow>
  ),
}

export const WithCollapsedState: Story = {
  render: (args) => <CollapsedStateDemo args={args} />,
}
