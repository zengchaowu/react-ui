import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwChromeTab } from './CwChromeTab'
import type { CwChromeTabItem } from '@zengchaowu/ui-shared/components/CwChromeTab/types'

const meta: Meta<typeof CwChromeTab> = {
  title: '1. Components/Navigation/CwChromeTab',
  component: CwChromeTab,
  argTypes: {
    topRounded: {
      control: { type: 'select', options: ['', 'sm', 'md', 'lg', 'xl', '2xl'] },
      description: '标签顶部圆角大小',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwChromeTab>

const defaultTabs: CwChromeTabItem[] = [
  { id: 'tab1', label: '首页' },
  { id: 'tab2', label: '文档' },
  { id: 'tab3', label: '设置' },
]

function ChromeTabDemo({
  initialTabs,
  initialActiveId = 'tab1',
  ...args
}: Partial<ComponentProps<typeof CwChromeTab>> & {
  initialTabs: CwChromeTabItem[]
  initialActiveId?: string | number
}) {
  const [activeId, setActiveId] = useState<string | number | null>(initialActiveId)
  const [tabs, setTabs] = useState<CwChromeTabItem[]>(initialTabs)

  return (
    <CwChromeTab
      {...args}
      tabs={tabs}
      activeId={activeId}
      onActiveIdChange={setActiveId}
      onClose={(id) => setTabs((prev) => prev.filter((t) => t.id !== id))}
      onCloseOthers={(_keep, ids) => setTabs((prev) => prev.filter((t) => !ids.includes(t.id)))}
      onCloseToTheRight={(_id, ids) =>
        setTabs((prev) => prev.filter((t) => !ids.includes(t.id)))
      }
      onCloseAll={(ids) => setTabs((prev) => prev.filter((t) => !ids.includes(t.id)))}
    />
  )
}

/** 基础三标签，无圆角 */
export const Default: Story = {
  args: {
    activeId: 'tab1',
    closable: false,
    addable: false,
    topRounded: '',
  },
  render: (args) => (
    <ChromeTabDemo
      {...args}
      initialTabs={defaultTabs}
      initialActiveId={args.activeId ?? 'tab1'}
    />
  ),
}

/** 带圆角的卡片标签 */
export const RoundedCard: Story = {
  args: {
    activeId: 'tab2',
    closable: true,
    addable: false,
    topRounded: 'lg',
  },
  render: (args) => (
    <ChromeTabDemo
      {...args}
      initialTabs={defaultTabs}
      initialActiveId={args.activeId ?? 'tab1'}
    />
  ),
}

/** 可关闭+可添加+圆角 */
export const ClosableAndAddable: Story = {
  args: {
    activeId: 'tab1',
    closable: true,
    addable: true,
    topRounded: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: '右键标签可关闭当前 / 其他 / 右侧 / 全部标签。',
      },
    },
  },
  render: (args) => (
    <ChromeTabDemo
      {...args}
      initialTabs={defaultTabs}
      initialActiveId={args.activeId ?? 'tab1'}
    />
  ),
}

/** 带图标的标签 */
export const WithIcons: Story = {
  render: (args) => (
    <ChromeTabDemo
      {...args}
      initialTabs={[
        {
          id: 'tab1',
          label: '首页',
          icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z"/></svg>',
        },
        {
          id: 'tab2',
          label: '搜索',
          icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><path d="M10 10l4 4"/></svg>',
        },
        {
          id: 'tab3',
          label: '设置',
          icon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5"/></svg>',
        },
      ]}
      initialActiveId="tab1"
      topRounded="lg"
    />
  ),
}

/** 多标签 + 圆角，测试滚动溢出 */
export const ManyTabs: Story = {
  render: (args) => (
    <div className="max-w-[37.5rem]">
      <ChromeTabDemo
        {...args}
        initialTabs={Array.from({ length: 15 }, (_, i) => ({
          id: `tab${i + 1}`,
          label: `标签 ${i + 1}`,
        }))}
        initialActiveId="tab1"
        topRounded="md"
        closable
      />
    </div>
  ),
}

/** #tab-icon 插槽：无 tab.icon 时用插槽渲染图标 */
export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    activeId: 'tab1',
    closable: false,
    addable: false,
  },
  render: (args) => (
    <SlotStorySection slot="tab-icon">
      <div className="max-w-[30rem]">
        <ChromeTabDemo
          {...args}
          initialTabs={[
            { id: 'tab1', label: '消息' },
            { id: 'tab2', label: '通讯录' },
          ]}
          initialActiveId={args.activeId ?? 'tab1'}
          topRounded="md"
          tabIconSlot={({ tab }) => (
            <span
              className={[
                'mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full [font-size:var(--font-size-xs)] font-semibold',
                tab.id === 'tab1'
                  ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                  : 'bg-[var(--bg-color-component)] text-[var(--text-color-secondary)]',
              ].join(' ')}
            >
              {tab.label.slice(0, 1)}
            </span>
          )}
        />
      </div>
    </SlotStorySection>
  ),
}
