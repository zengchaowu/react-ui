import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwTabbar } from './CwTabbar'
import type { CwTabbarItem, CwTabbarProps } from './types'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'

const baseItems: CwTabbarItem[] = [
  { key: 'home', label: '首页', icon: 'common--nav--home-line', badge: 3 },
  { key: 'favorites', label: '收藏', icon: 'common--status--star-filled' },
  { key: 'security', label: '安全', icon: 'common--status--info-filled' },
  { key: 'settings', label: '设置', icon: 'common--nav--settings-line' },
]

const meta: Meta<typeof CwTabbar> = {
  title: '1. Components/Navigation/CwTabbar',
  component: CwTabbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '移动端底部导航栏组件，支持图标、文本、角标和键盘导航。',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['md', 'lg'],
      description: '尺寸：lg 放大图标与最小点击区域',
    },
    showTopDivider: {
      control: { type: 'boolean' },
      description: '横向时是否显示顶部分割线',
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: '横向为底部导航，纵向为侧栏',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用整个组件',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读（不可切换，但可聚焦）',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CwTabbar>

function TabbarDemo({ args, className }: { args: CwTabbarProps; className: string }) {
  const [value, setValue] = useState(args.items?.[0]?.key ?? '')

  useEffect(() => {
    if (args.items && args.items.length && !args.items.some((item) => item.key === value)) {
      setValue(args.items[0].key)
    }
  }, [args.items, value])

  return (
    <div className={className}>
      <CwTabbar {...args} value={value} onChange={setValue} />
    </div>
  )
}

export const Default: Story = {
  args: {
    disabled: false,
    readonly: false,
    items: baseItems,
  },
  render: (args) => <TabbarDemo args={args} className="w-[22.5rem]" />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
    readonly: false,
    items: baseItems,
  },
  render: (args) => <TabbarDemo args={args} className="w-[22.5rem]" />,
}

export const Readonly: Story = {
  args: {
    disabled: false,
    readonly: true,
    items: baseItems,
  },
  render: (args) => <TabbarDemo args={args} className="w-[22.5rem]" />,
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    disabled: false,
    readonly: false,
    items: baseItems,
  },
  render: (args) => (
    <TabbarDemo
      args={args}
      className="flex h-[26.25rem] w-[4.5rem] rounded-lg border border-[var(--border-color)] overflow-hidden"
    />
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => <WithSlotsDemo />,
}

function WithSlotsDemo() {
  const [iconValue, setIconValue] = useState('home')
  const [labelValue, setLabelValue] = useState('home')
  const slotArgs = { disabled: false, readonly: false, items: baseItems }
  return (
    <div className="flex w-[22.5rem] flex-col gap-10">
      <SlotStorySection slot="item-icon">
        <CwTabbar
          {...slotArgs}
          value={iconValue}
          onChange={setIconValue}
          itemIconSlot={({ item }) => (
            <span
              className={[
                'inline-flex h-5 w-5 items-center justify-center rounded [font-size:var(--font-size-xs)] font-bold',
                item.key === iconValue
                  ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                  : 'bg-[var(--bg-color-component)] text-[var(--text-color-secondary)]',
              ].join(' ')}
            >
              {item.label.slice(0, 1)}
            </span>
          )}
        />
      </SlotStorySection>
      <SlotStorySection slot="item-label">
        <CwTabbar
          {...slotArgs}
          value={labelValue}
          onChange={setLabelValue}
          itemLabelSlot={({ item }) => (
            <span className="[font-size:var(--font-size-caption)] font-medium">{item.label}</span>
          )}
        />
      </SlotStorySection>
    </div>
  )
}

export const ScrollableManyItems: Story = {
  args: {
    disabled: false,
    readonly: false,
    showTopDivider: false,
    itemsScrollable: true,
    items: Array.from({ length: 10 }, (_, i) => ({
      key: `tab-${i + 1}`,
      label: `Tab ${i + 1}`,
      icon: [
        'common--nav--home-line',
        'common--status--star-filled',
        'common--status--info-filled',
        'common--nav--settings-line',
      ][i % 4]!,
    })),
  },
  render: (args) => (
    <TabbarDemo
      args={args}
      className="w-[22.5rem] border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-color-container)]"
    />
  ),
}

export const CustomStyles: Story = {
  args: {
    disabled: false,
    readonly: false,
    items: baseItems,
  },
  render: (args) => <CustomStylesDemo args={args} />,
}

function CustomStylesDemo({ args }: { args: CwTabbarProps }) {
  const [value, setValue] = useState('favorites')
  return (
    <div className="w-[22.5rem]">
      <CwTabbar
        {...args}
        value={value}
        onChange={setValue}
        className="hairline-border-t border-[var(--brand-color-special)] bg-[var(--button-brand-tint-active-bg)]"
      />
    </div>
  )
}

export const AppearanceSidebar: Story = {
  render: () => <AppearanceSidebarDemo />,
}

function AppearanceSidebarDemo() {
  const [value, setValue] = useState('home')
  return (
    <div className="h-[22.5rem] w-20">
      <CwTabbar
        value={value}
        onChange={setValue}
        appearance="sidebar"
        orientation="vertical"
        showTopDivider={false}
        size="lg"
        items={baseItems}
      />
    </div>
  )
}

export const AppearanceBottomBar: Story = {
  render: () => <AppearanceBottomBarDemo />,
}

function AppearanceBottomBarDemo() {
  const [value, setValue] = useState('home')
  return (
    <div className="w-[22.5rem]">
      <CwTabbar
        value={value}
        onChange={setValue}
        appearance="bottom-bar"
        showTopDivider={false}
        items={baseItems}
      />
    </div>
  )
}
