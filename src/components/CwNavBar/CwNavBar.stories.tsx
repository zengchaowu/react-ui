import type { Meta, StoryObj } from '@storybook/react'
import { CwNavBar } from './CwNavBar'
import { CW_NAV_BAR_ICON_BUTTON_CLASS } from './styles'

const meta: Meta<typeof CwNavBar> = {
  title: '1. Components/Navigation/CwNavBar',
  component: CwNavBar,
}

export default meta
type Story = StoryObj<typeof CwNavBar>

export const Default: Story = {
  args: {
    title: '页面标题',
    leftSlot: (
      <div role="button" tabIndex={0} className={CW_NAV_BAR_ICON_BUTTON_CLASS} aria-label="返回">
        <span aria-hidden="true">‹</span>
      </div>
    ),
    rightSlot: <span>更多</span>,
  },
}

export const AbsoluteTitle: Story = {
  args: {
    title: '聊天',
    titleAlign: 'absolute',
    appearance: 'emphasized',
  },
}
