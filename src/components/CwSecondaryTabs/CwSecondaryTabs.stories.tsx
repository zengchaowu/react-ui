import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwSecondaryTabs } from './CwSecondaryTabs'
import type { CwSecondaryTabsProps } from './types'

const meta: Meta<typeof CwSecondaryTabs> = {
  title: '1. Components/Navigation/CwSecondaryTabs',
  component: CwSecondaryTabs,
}

export default meta
type Story = StoryObj<typeof CwSecondaryTabs>

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'ok' },
]

function ControlledSecondaryTabs(props: CwSecondaryTabsProps) {
  const [active, setActive] = useState(props.activeTab)
  return (
    <CwSecondaryTabs
      {...props}
      activeTab={active}
      onActiveTabChange={setActive}
    />
  )
}

export const Default: Story = {
  args: {
    activeTab: 'all',
    tabs,
  },
  render: (args) => <ControlledSecondaryTabs {...args} />,
}
