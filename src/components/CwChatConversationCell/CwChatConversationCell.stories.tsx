import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc } from '../../storybook/chatDefaultAvatar'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwIcon } from '../CwIcon'
import { CwChatConversationCell } from './CwChatConversationCell'

const meta: Meta<typeof CwChatConversationCell> = {
  title: '1. Components/Chat/CwChatConversationCell',
  component: CwChatConversationCell,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  name: '产品周会',
  avatar: storybookChatDefaultAvatarSrc,
  avatarFallbackSrc: storybookChatDefaultAvatarSrc,
  description: '附件：季度规划.pdf',
  time: '10:20',
  showRedDot: false,
  selected: false,
}

export const Default: Story = {
  args: {
    name: '张三',
    avatar: storybookChatDefaultAvatarSrc,
    avatarFallbackSrc: storybookChatDefaultAvatarSrc,
    description: '你好，最近怎么样？',
    time: '5分钟前',
    showRedDot: true,
    selected: false,
  },
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[22.5rem] flex-col gap-8">
      <SlotStorySection slot="name">
        <div className="border border-[var(--border-color)]">
          <CwChatConversationCell
            {...baseArgs}
            nameSlot={
              <span className="shrink-0 rounded bg-[var(--button-brand-tint-hover-bg)] px-1 [font-size:var(--font-size-xs)] text-[var(--brand-color-6)]">
                外部
              </span>
            }
          />
        </div>
      </SlotStorySection>
      <SlotStorySection slot="description">
        <div className="border border-[var(--border-color)]">
          <CwChatConversationCell
            {...baseArgs}
            descriptionSlot={
              <CwIcon
                name="chat--session--pin-line"
                prefix="icon"
                size={0.875}
                className="text-[var(--text-color-placeholder)]"
              />
            }
          />
        </div>
      </SlotStorySection>
    </div>
  ),
}

export const Selected: Story = {
  args: {
    name: '李四',
    avatar: storybookChatDefaultAvatarSrc,
    avatarFallbackSrc: storybookChatDefaultAvatarSrc,
    description: '[图片]',
    time: '昨天',
    showRedDot: false,
    selected: true,
  },
}
