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
