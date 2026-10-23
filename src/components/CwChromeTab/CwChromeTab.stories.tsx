import type { Meta, StoryObj } from '@storybook/react'
import { CwChromeTab } from './CwChromeTab'

const meta: Meta<typeof CwChromeTab> = {
  title: '1. Components/Navigation/CwChromeTab',
  component: CwChromeTab,
}

export default meta
type Story = StoryObj<typeof CwChromeTab>

const demoTabs = [
  { id: 'tab1', label: '首页' },
  { id: 'tab2', label: '文档' },
  { id: 'tab3', label: '设置' },
]

export const Default: Story = {
  args: {
    tabs: demoTabs,
    activeId: 'tab1',
    closable: true,
    addable: true,
    topRounded: 'lg',
  },
  render: (args) => (
    <div className="max-w-[37.5rem]">
      <CwChromeTab {...args} />
    </div>
  ),
}
