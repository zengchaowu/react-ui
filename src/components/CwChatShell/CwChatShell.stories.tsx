import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { storybookChatDefaultAvatarSrc } from '../../storybook/chatDefaultAvatar'
import { CwChatShellLayout } from './CwChatShellLayout'
import { CwChatShellTabIcon } from './CwChatShellTabIcon'
import type { CwChatShellTabItem } from './types'

const shellItems: CwChatShellTabItem[] = [
  { key: 'im', label: '消息', icon: 'chat--msg--chat-line', iconName: 'chat--msg--chat-line' },
  { key: 'contacts', label: '通讯录', icon: 'common--user--user-line', iconName: 'common--user--user-line' },
  {
    key: 'mine',
    label: '我的',
    icon: 'common--user--user-line',
    iconName: 'common--user--user-line',
    useMineAvatar: true,
  },
]

const shellWrap = 'h-[22.5rem] w-full max-w-[45rem] border border-[var(--border-color)]'
const mainPlaceholder =
  'flex h-full items-center justify-center bg-[var(--bg-color-page)] text-xs text-[var(--text-color-secondary)]'

const meta: Meta<typeof CwChatShellLayout> = {
  title: '1. Components/Chat/CwChatShell',
  component: CwChatShellLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Chat 壳层布局：侧栏/底栏导航 + `#main` 主内容区；支持 `#item-icon`、`#footer` 插槽。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showNav: { control: { type: 'boolean' } },
    navVisible: { control: { type: 'boolean' } },
    showMobileTabbar: { control: { type: 'boolean' } },
    frameHeight: { control: { type: 'text' } },
    navTooltipOffset: { control: { type: 'number', min: 0, step: 1 } },
    mobileTooltipOffset: { control: { type: 'number', min: 0, step: 1 } },
    navTooltipTouchLongPress: { control: { type: 'boolean' } },
    navItems: { control: false },
    mobileItems: { control: false },
  },
  args: {
    showNav: true,
    navVisible: true,
    showMobileTabbar: true,
    frameHeight: '360px',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ChatShellDemo args={args} />,
}

function ChatShellDemo({ args }: { args: Story['args'] }) {
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
            mineAvatarFallbackSrc={storybookChatDefaultAvatarSrc}
          />
        )}
        mainSlot={<div className={mainPlaceholder}>主内容区（#main）</div>}
      />
    </div>
  )
}

function ChatShellSlotsDemo({ args }: { args: Story['args'] }) {
  const [value, setValue] = useState('im')

  return (
    <div className="flex flex-col gap-10 p-4">
      <SlotStorySection slot="item-icon">
        <div className={shellWrap}>
          <CwChatShellLayout
            {...args}
            value={value}
            navItems={shellItems}
            mobileItems={shellItems}
            showMobileTabbar={false}
            frameHeight="360px"
            onUpdateModelValue={setValue}
            itemIconSlot={(scope) => (
              <span
                className={[
                  'inline-flex h-5 w-5 items-center justify-center rounded font-bold [font-size:var(--font-size-xs)]',
                  scope.active
                    ? 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]'
                    : 'bg-[var(--bg-color-component)] text-[var(--text-color-secondary)]',
                ].join(' ')}
              >
                {scope.item.label.slice(0, 1)}
              </span>
            )}
            mainSlot={<div className={mainPlaceholder}>仅演示 #item-icon</div>}
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="footer">
        <div className={shellWrap}>
          <CwChatShellLayout
            {...args}
            value={value}
            navItems={shellItems}
            mobileItems={shellItems}
            showMobileTabbar={false}
            frameHeight="360px"
            onUpdateModelValue={setValue}
            footerSlot={
              <div className="px-2 py-2 text-center [font-size:var(--font-size-xs)] text-[var(--text-color-placeholder)]">
                侧栏底部 #footer
              </div>
            }
            mainSlot={<div className={mainPlaceholder}>仅演示 #footer</div>}
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="main">
        <div className={shellWrap}>
          <CwChatShellLayout
            {...args}
            value={value}
            navItems={shellItems}
            mobileItems={shellItems}
            frameHeight="360px"
            onUpdateModelValue={setValue}
            itemIconSlot={(scope) => (
              <CwChatShellTabIcon
                item={scope.item}
                active={scope.active}
                iconStyles={scope.iconStyles}
                mineAvatarFallbackSrc={storybookChatDefaultAvatarSrc}
              />
            )}
            mainSlot={
              <div className="flex h-full flex-col items-center justify-center gap-1 bg-[var(--bg-color-page)] p-4">
                <p className="text-sm text-[var(--text-color-primary)]">业务主区 #main</p>
                <p className="text-xs text-[var(--text-color-secondary)]">当前 Tab：{value}</p>
              </div>
            }
          />
        </div>
      </SlotStorySection>
    </div>
  )
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: (args) => <ChatShellSlotsDemo args={args} />,
}
