import type { Meta, StoryObj } from '@storybook/react'
import { CwSidebarNav } from './CwSidebarNav'
import type { CwSidebarNavSection } from './types'

const explorerSections: CwSidebarNavSection[] = [
  {
    key: 'libraries',
    items: [{ key: 'home', label: 'Home', icon: 'common--nav--home-line' }],
  },
  {
    key: 'quick',
    label: 'Quick access',
    items: [
      { key: 'desktop', label: 'Desktop', icon: 'windows--desktop', pinned: true },
      { key: 'downloads', label: 'Downloads', icon: 'windows--downloads', pinned: true },
    ],
  },
]

const meta: Meta<typeof CwSidebarNav> = {
  title: '1. Components/Navigation/CwSidebarNav',
  component: CwSidebarNav,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Explorer-style sidebar navigation: labeled sections + flat icon rows on CwButton list-item. Pair with CwNavigationTree for hierarchical menus.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'text' }, description: '当前选中项 key' },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'explorer'],
      description: '外观',
    },
    iconSize: { control: { type: 'number' }, description: '图标尺寸 (rem)' },
    iconPrefix: { control: { type: 'text' }, description: '图标前缀' },
    ariaLabel: { control: { type: 'text' }, description: '无障碍标签' },
    sections: { control: { type: 'object' }, description: '分组导航数据' },
    items: { control: false },
    texts: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof CwSidebarNav>

export const Default: Story = {
  args: {
    appearance: 'explorer',
    ariaLabel: 'Navigation',
    value: 'desktop',
    sections: explorerSections,
  },
  render: (args) => (
    <div className="h-80 w-56 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-1">
      <CwSidebarNav {...args} />
    </div>
  ),
}
