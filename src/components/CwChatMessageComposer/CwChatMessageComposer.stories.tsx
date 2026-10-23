import type { Meta, StoryObj } from '@storybook/react'
import { CwChatMessageComposer } from './CwChatMessageComposer'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { storybookChatDefaultAvatarSrc } from '../../storybook/chatDefaultAvatar'
import {
  storybookChatMobileMoreDemoItems,
  storybookChatToolbarDemoItems,
} from '../../storybook/chatToolbarDemoItems'

const meta: Meta<typeof CwChatMessageComposer> = {
  title: '1. Components/Chat/CwChatMessageComposer',
  component: CwChatMessageComposer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '聊天输入组合：`CwChatToolbar` + 隐藏 file input + `CwMessageInput`；支持工具栏选图/文件、表情、外部拖入附件与树节点路径拖入。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md border border-[var(--border-color)] bg-[var(--bg-color-container)]">
        <Story />
      </div>
    ),
  ],
  args: {
    mentionAvatarFallbackSrc: storybookChatDefaultAvatarSrc,
  },
}

export default meta
type Story = StoryObj<typeof CwChatMessageComposer>

const demoToolbarItems = [...storybookChatToolbarDemoItems]
const demoMobileMoreItems = [...storybookChatMobileMoreDemoItems]

const defaultArgs = {
  disabled: false,
  showToolbar: true,
  toolbarItems: demoToolbarItems,
  mobileMorePanelItems: demoMobileMoreItems,
  enableAttachments: false,
  placeholder: '发消息…',
  maxLength: 500,
}

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
}

export const WithAttachments: Story = {
  args: {
    ...defaultArgs,
    enableAttachments: true,
    attachmentMultiple: true,
  },
}

export const ToolbarHidden: Story = {
  args: {
    ...defaultArgs,
    showToolbar: false,
  },
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  args: {
    ...defaultArgs,
    showToolbar: true,
    enableAttachments: true,
  },
  render: (args) => (
    <SlotStorySection slot="toolbar-append">
      <CwChatMessageComposer
        {...args}
        toolbarAppendSlot={
          <div
            role="button"
            tabIndex={0}
            className="rounded px-2 py-1 text-xs text-[var(--brand-color-6)] hover:bg-[var(--bg-color-component-hover)]"
          >
            @
          </div>
        }
      />
    </SlotStorySection>
  ),
}
