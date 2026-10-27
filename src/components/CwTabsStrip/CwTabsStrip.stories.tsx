import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwTabsStrip } from './CwTabsStrip'
import type {
  CwTabsStripItem,
  CwTabsStripProps,
  CwTabsStripValue,
} from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const meta: Meta<typeof CwTabsStrip> = {
  title: '1. Components/Navigation/CwTabsStrip',
  component: CwTabsStrip,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '统一 Tab 条：横向/纵向、滚动或等分、指示条与角标；支持 v-model:activeIndex 与 v-model。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeIndex: { control: 'number', description: '当前激活索引（v-model:activeIndex）' },
    value: { control: 'text', description: '当前选中项的值（v-model:modelValue）' },
    items: { control: 'object', description: 'Tab 列表' },
    equalWidth: { control: 'boolean', description: 'Tab 等分宽度（横向）' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    indicatorPlacement: { control: 'select', options: ['start', 'end'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
}

export default meta
type Story = StoryObj<typeof CwTabsStrip>

const defaultItems: CwTabsStripItem[] = [
  { label: '投保须知' },
  { label: '保险条款' },
  { label: '特别约定' },
  { label: '理赔须知' },
]

function DefaultDemo(args: CwTabsStripProps) {
  const [active, setActive] = useState(args.activeIndex ?? 0)

  useEffect(() => {
    if (args.activeIndex != null) setActive(args.activeIndex)
  }, [args.activeIndex])

  return (
    <div className="min-h-screen p-4 bg-[var(--bg-color-page)]">
      <CwTabsStrip
        {...args}
        activeIndex={active}
        onActiveIndexChange={setActive}
        onChange={(i, v) => console.log('change', i, v)}
      />
      <div className="mt-3 text-xs text-[var(--text-color-secondary)]">
        activeIndex: {active}
      </div>
    </div>
  )
}

export const Default: Story = {
  args: {
    activeIndex: 0,
    items: defaultItems,
  },
  render: (args) => <DefaultDemo {...args} />,
}

function ActiveDemo(args: CwTabsStripProps) {
  const [active, setActive] = useState(args.activeIndex ?? 0)
  return (
    <div className="min-h-screen p-4 bg-[var(--bg-color-page)]">
      <CwTabsStrip
        {...args}
        activeIndex={active}
        onActiveIndexChange={setActive}
      />
    </div>
  )
}

export const ManyTabs: Story = {
  args: {
    activeIndex: 2,
    items: [
      { label: 'Tab 1' },
      { label: 'Tab 2' },
      { label: 'Tab 3' },
      { label: 'Tab 4' },
      { label: 'Tab 5' },
      { label: 'Tab 6' },
    ],
  },
  render: (args) => <ActiveDemo {...args} />,
}

function ModelAndActiveDemo(args: CwTabsStripProps) {
  const [active, setActive] = useState(args.activeIndex ?? 0)
  const [model, setModel] = useState<CwTabsStripValue | undefined>('all')
  return (
    <div className="min-h-screen p-4 bg-[var(--bg-color-page)]">
      <CwTabsStrip
        {...args}
        activeIndex={active}
        onActiveIndexChange={setActive}
        value={model}
        onChange={(_i, v) => setModel(v)}
      />
      <div className="mt-3 text-xs text-[var(--text-color-secondary)]">
        value: {model} · activeIndex: {active}
      </div>
    </div>
  )
}

export const EqualWidth: Story = {
  args: {
    activeIndex: 0,
    equalWidth: true,
    items: [
      { label: '全部', value: 'all' },
      { label: '待审批', value: 'pending' },
      { label: '已通过', value: 'ok' },
      { label: '已驳回', value: 'reject' },
    ],
  },
  render: (args) => <ModelAndActiveDemo {...args} />,
}

function ChatListHeaderDemo() {
  const items: CwTabsStripItem[] = [
    { label: '会话', value: 'chat' },
    { label: '通讯录', value: 'contacts' },
  ]
  const [model, setModel] = useState<CwTabsStripValue>('chat')
  return (
    <CwTabsStrip
      value={model}
      onChange={(_i, v) => setModel(v ?? 'chat')}
      items={items}
      equalWidth
      tabFlushStart
      tabFlushEnd
      className="max-w-md border border-[var(--border-color)] rounded-md"
    />
  )
}

export const ChatListHeader: Story = {
  render: () => <ChatListHeaderDemo />,
}

export const WithBadge: Story = {
  args: {
    activeIndex: 0,
    items: [
      { label: '消息', badge: { content: 8 } },
      { label: '待办', badge: { dot: true } },
      { label: '已读' },
      { label: '系统通知', badge: { content: 'NEW' } },
    ],
  },
  render: (args) => <ActiveDemo {...args} />,
}

const baseItems: CwTabsStripItem[] = [
  { value: 'overview', label: '总览' },
  { value: 'analytics', label: '分析' },
  { value: 'reports', label: '报表' },
  { value: 'settings', label: '设置', disabled: true },
]

function PcTabsModelValueDemo(args: CwTabsStripProps) {
  const [value, setValue] = useState<CwTabsStripValue | undefined>(() => {
    const list = args.items ?? []
    const firstEnabled = list.find((item) => !item.disabled)
    return firstEnabled?.value ?? list[0]?.value
  })

  useEffect(() => {
    const list = args.items
    if (!list || !list.length) {
      setValue(undefined)
      return
    }
    setValue((current) => {
      const ok = list.some((item) => item.value === current && !item.disabled)
      if (ok) return current
      const firstEnabled = list.find((item) => !item.disabled)
      return firstEnabled ? firstEnabled.value : (list[0].value ?? undefined)
    })
  }, [args.items])

  return (
    <div className="w-[30rem]">
      <CwTabsStrip
        {...args}
        value={value}
        onChange={(_i, v) => setValue(v)}
      />
    </div>
  )
}

export const PcTabsModelValue: Story = {
  args: {
    disabled: false,
    readonly: false,
    orientation: 'horizontal',
    indicatorPlacement: 'end',
    size: 'medium',
    items: baseItems,
  },
  render: (args) => <PcTabsModelValueDemo {...args} />,
}

function FixedValueDemo(args: CwTabsStripProps, initial: CwTabsStripValue) {
  const [value, setValue] = useState<CwTabsStripValue | undefined>(initial)
  return (
    <div className="w-[30rem]">
      <CwTabsStrip
        {...args}
        value={value}
        onChange={(_i, v) => setValue(v)}
      />
    </div>
  )
}

export const Readonly: Story = {
  args: {
    readonly: true,
    orientation: 'horizontal',
    indicatorPlacement: 'end',
    items: baseItems,
  },
  render: (args) => FixedValueDemo(args, 'overview'),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    orientation: 'horizontal',
    indicatorPlacement: 'end',
    items: baseItems,
  },
  render: (args) => FixedValueDemo(args, 'overview'),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    indicatorPlacement: 'start',
    items: baseItems,
  },
  render: (args) => (
    <div className="w-[13.75rem] border border-[var(--border-color)] rounded-md p-2">
      {FixedValueDemo(args, 'overview')}
    </div>
  ),
}

function WithSlotsDemo(args: CwTabsStripProps) {
  const [value, setValue] = useState<CwTabsStripValue | undefined>('overview')
  return (
    <SlotStorySection slot="tab">
      <div className="w-[30rem]">
        <CwTabsStrip
          {...args}
          value={value}
          onChange={(_i, v) => setValue(v)}
          tabSlot={({ item }) => (
            <>
              <span className="text-sm">{item.label}</span>
              {item.badge ? (
                <span className="ml-1 rounded-full bg-[var(--error-color-6)] px-1.5 [font-size:var(--font-size-xs)] text-[var(--text-color-anti)]">
                  {String(item.badge)}
                </span>
              ) : null}
            </>
          )}
        />
      </div>
    </SlotStorySection>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    orientation: 'horizontal',
    indicatorPlacement: 'end',
    items: [
      { label: '概览', value: 'overview', badge: 2 },
      { label: '设置', value: 'settings' },
    ],
  },
  render: (args) => <WithSlotsDemo {...args} />,
}

export const IndicatorOnTop: Story = {
  args: {
    orientation: 'horizontal',
    indicatorPlacement: 'start',
    items: baseItems,
  },
  render: (args) => FixedValueDemo(args, 'overview'),
}

type SizesDemoProps = Partial<
  Pick<CwTabsStripProps, 'items' | 'orientation' | 'indicatorPlacement'>
>

function SizesDemo({
  items = baseItems,
  orientation,
  indicatorPlacement,
}: SizesDemoProps) {
  const sizes = [
    { value: 'small', label: '小号' },
    { value: 'medium', label: '中号' },
    { value: 'large', label: '大号' },
  ] as const
  const [values, setValues] = useState<
    Record<string, CwTabsStripValue | undefined>
  >({ small: 'overview', medium: 'overview', large: 'overview' })

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-[var(--text-color-secondary)]">
        不同尺寸（size）
      </div>
      <div className="flex flex-col gap-4">
        {sizes.map((item) => (
          <div key={item.value} className="w-[30rem]">
            <div className="text-xs text-[var(--text-color-secondary)] mb-2">
              {item.label}
            </div>
            <CwTabsStrip
              size={item.value}
              items={items}
              orientation={orientation}
              indicatorPlacement={indicatorPlacement}
              value={values[item.value]}
              onChange={(_i, v) =>
                setValues((prev) => ({ ...prev, [item.value]: v }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const Sizes: Story = {
  args: {
    orientation: 'horizontal',
    indicatorPlacement: 'end',
    items: baseItems,
  },
  render: (args) => <SizesDemo {...args} />,
}
