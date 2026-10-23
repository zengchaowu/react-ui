import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwChatShellLayout } from './CwChatShellLayout'
import { CwChatShellTabIcon } from './CwChatShellTabIcon'
import type { CwChatShellTabItem } from './types'

const shellItems: CwChatShellTabItem[] = [
  { key: 'im', label: '消息', icon: 'chat--msg--chat-line', iconName: 'chat--msg--chat-line' },
  { key: 'contacts', label: '通讯录', icon: 'common--user--user-line', iconName: 'common--user--user-line' },
  { key: 'mine', label: '我的', icon: 'common--user--user-line', iconName: 'common--user--user-line', useMineAvatar: true },
]

const shellWrap = 'h-[22.5rem] w-full max-w-[45rem] border border-[var(--border-color)]'
const mainPlaceholder =
  'flex h-full items-center justify-center bg-[var(--bg-color-page)] text-xs text-[var(--text-color-secondary)]'

const meta: Meta<typeof CwChatShellLayout> = {
  title: '1. Components/Chat/CwChatShell',
  component: CwChatShellLayout,
  args: {
    showNav: true,
    navVisible: true,
    showMobileTabbar: true,
    frameHeight: '360px',
  },
}

export default meta
type Story = StoryObj<typeof CwChatShellLayout>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('im')
    return (
      <div className={shellWrap}>
        <CwChatShellLayout
          {...args}
          value={value}
          navItems={shellItems}
          mobileItems={shellItems}
          onUpdateModelValue={setValue}
          itemIconSlot={(scope) => (
            <CwChatShellTabIcon
              item={scope.item}
              active={scope.active}
              iconStyles={scope.iconStyles}
            />
          )}
          mainSlot={<div className={mainPlaceholder}>主内容区（#main）</div>}
        />
      </div>
    )
  },
}
