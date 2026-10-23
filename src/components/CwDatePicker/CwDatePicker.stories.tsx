import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwDatePicker } from './CwDatePicker'
import { CwDatePickerContent } from './CwDatePickerContent'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import type {
  CwDatePickerModelValue,
  CwDatePickerProps,
  CwDatePickerShortcut,
} from './types'

const meta: Meta<typeof CwDatePicker> = {
  title: '1. Components/Form/CwDatePicker',
  component: CwDatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '参考 Arco DatePicker 交互实现的日期选择组件，支持键盘导航、禁用/只读、边界限制、快捷选择与清除。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
    },
    format: {
      control: { type: 'text' },
    },
    valueType: {
      control: { type: 'select' },
      options: ['string', 'date', 'timestamp'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    readonly: {
      control: { type: 'boolean' },
    },
    clearable: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    firstDayOfWeek: {
      control: { type: 'select' },
      options: [0, 1],
    },
  },
}

export default meta
type Story = StoryObj<typeof CwDatePicker>

function DatePickerDemo({ args }: { args: CwDatePickerProps }) {
  const [value, setValue] = useState<CwDatePickerModelValue>('2026-03-19')
  return (
    <div className="w-[20rem]">
      <CwDatePicker {...args} value={value} onChange={(next) => setValue(next)} />
    </div>
  )
}

export const States: Story = {
  args: {
    format: 'YYYY-MM-DD',
    clearable: true,
  },
  render: (args) => <DatePickerDemo args={args} />,
}

export const Readonly: Story = {
  args: {
    readonly: true,
  },
  render: (args) => <DatePickerDemo args={args} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <DatePickerDemo args={args} />,
}

export const BoundariesAndShortcuts: Story = {
  args: {
    minDate: '2026-03-01',
    maxDate: '2026-03-31',
    shortcuts: [
      { label: '今天', value: () => new Date() },
      { label: '月初', value: '2026-03-01' },
      { label: '月末', value: '2026-03-31' },
    ],
  },
  render: (args) => {
    return <BoundariesDemo args={args} />
  },
}

function BoundariesDemo({ args }: { args: CwDatePickerProps }) {
  const [value, setValue] = useState<CwDatePickerModelValue>('2026-03-10')
  return (
    <div className="w-[20rem]">
      <CwDatePicker {...args} value={value} onChange={(next) => setValue(next)} />
    </div>
  )
}

export const Range: Story = {
  args: {
    range: true,
  },
  render: (args) => <RangeDemo args={args} />,
}

function RangeDemo({ args }: { args: CwDatePickerProps }) {
  const [value, setValue] = useState<CwDatePickerModelValue>([
    '2026-03-05',
    '2026-03-20',
  ])
  return (
    <div className="w-[22.5rem]">
      <CwDatePicker {...args} value={value} onChange={(next) => setValue(next)} />
    </div>
  )
}

export const Sizes: Story = {
  render: () => <SizesDemo />,
}

function SizesDemo() {
  const [smallValue, setSmallValue] = useState<CwDatePickerModelValue>('2026-03-11')
  const [mediumValue, setMediumValue] = useState<CwDatePickerModelValue>('2026-03-12')
  const [largeValue, setLargeValue] = useState<CwDatePickerModelValue>('2026-03-13')
  return (
    <div className="w-[20rem] flex flex-col gap-4">
      <CwDatePicker size="small" value={smallValue} onChange={(next) => setSmallValue(next)} />
      <CwDatePicker size="medium" value={mediumValue} onChange={(next) => setMediumValue(next)} />
      <CwDatePicker size="large" value={largeValue} onChange={(next) => setLargeValue(next)} />
    </div>
  )
}

export const Content: Story = {
  render: () => <ContentDemo />,
}

function ContentDemo() {
  const [singleValue, setSingleValue] = useState<CwDatePickerModelValue>('2026-03-12')
  const [rangeValue, setRangeValue] = useState<CwDatePickerModelValue>([
    '2026-03-08',
    '2026-03-18',
  ])
  return (
    <div className="flex gap-6">
      <CwDatePickerContent
        size="medium"
        value={singleValue}
        onChange={(next) => setSingleValue(next)}
      />
      <CwDatePickerContent
        range
        size="medium"
        value={rangeValue}
        onChange={(next) => setRangeValue(next)}
      />
    </div>
  )
}

/** `CwDatePickerContent` 的 #footer 插槽（面板底部快捷区） */
export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

function WithSlotsDemo() {
  const [value, setValue] = useState<CwDatePickerModelValue>('2026-03-15')
  const shortcuts: CwDatePickerShortcut[] = [
    { label: '今天', value: () => new Date() },
    { label: '下周一', value: '2026-03-23' },
  ]
  return (
    <SlotStorySection slot="footer">
      <CwDatePickerContent
        size="medium"
        value={value}
        shortcuts={shortcuts}
        showTodayButton
        onChange={(next) => setValue(next)}
        footerSlot={({ onToday, onShortcut, todayText, shortcuts: sc }) => (
          <div className="flex flex-wrap gap-2 hairline-border-t border-[var(--border-color)] px-3 py-2">
            <div
              role="button"
              tabIndex={0}
              className="rounded px-2 py-1 text-xs text-[var(--brand-color-6)] hover:bg-[var(--bg-color-component-hover)]"
              onClick={() => onToday()}
            >
              {todayText}（自定义底栏）
            </div>
            {sc.map((s) => (
              <div
                key={s.label}
                role="button"
                tabIndex={0}
                className="rounded px-2 py-1 text-xs text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)]"
                onClick={() => onShortcut(s.value)}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      />
    </SlotStorySection>
  )
}
