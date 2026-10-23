import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CwStickyTabs } from './CwStickyTabs'
import type { CwStickyTabsProps } from './types'

const meta: Meta<typeof CwStickyTabs> = {
  title: '1. Components/Navigation/CwStickyTabs',
  component: CwStickyTabs,
}

export default meta
type Story = StoryObj<typeof CwStickyTabs>

const tabs = [
  { label: '概览', refName: 'overview' },
  { label: '详情', refName: 'detail' },
  { label: '设置', refName: 'settings' },
]

function ControlledStickyTabs(props: CwStickyTabsProps) {
  const [active, setActive] = useState(props.activeIndex ?? 0)
  return (
    <CwStickyTabs
      {...props}
      activeIndex={active}
      onActiveIndexChange={setActive}
    />
  )
}

export const Default: Story = {
  args: {
    tabs,
    activeIndex: 0,
  },
  render: (args) => <ControlledStickyTabs {...args} />,
}
