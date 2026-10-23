import type { Meta, StoryObj } from '@storybook/react'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { CwAvatar } from './CwAvatar'

const meta: Meta<typeof CwAvatar> = {
  title: '1. Components/Display/CwAvatar',
  component: CwAvatar,
  args: {
    fallbackSrc: chatDefaultAvatar,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '头像组件，基于 CwImg。展示 `src` 主图；无图或加载失败时使用必传的 `fallbackSrc` 占位图。`text` 仅作图片 alt。场景：`appearance`（default / ring-light / ring-bordered）+ `shape` / `size`；IM 列表用 `CW_CHAT_AVATAR_PROPS`。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: { type: 'text' },
      description: '头像图片地址',
    },
    fallbackSrc: {
      control: { type: 'text' },
      description: '占位图 URL（必填）',
    },
    text: {
      control: { type: 'text' },
      description: '图片 alt（无障碍，不在画面上显示）',
    },
    shape: {
      control: { type: 'select' },
      options: ['circle', 'square'],
      description: '头像形状',
    },
    size: {
      control: { type: 'number' },
      description: '边长 rem',
    },
    appearance: {
      control: { type: 'select' },
      options: ['default', 'ring-light', 'ring-bordered'],
      description: '官方场景外观',
    },
    elevation: {
      control: { type: 'select' },
      options: ['soft', 'strong'],
      description: '仅 ring-light：阴影强度',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwAvatar>

export const WithImage: Story = {
  args: {
    src: chatDefaultAvatar,
    shape: 'circle',
    size: 2.5,
  },
}

export const FallbackOnly: Story = {
  args: {
    shape: 'circle',
    size: 2.5,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CwAvatar src={chatDefaultAvatar} fallbackSrc={chatDefaultAvatar} size={2} />
      <CwAvatar src={chatDefaultAvatar} fallbackSrc={chatDefaultAvatar} size={2.5} />
      <CwAvatar src={chatDefaultAvatar} fallbackSrc={chatDefaultAvatar} size={3.5} />
      <CwAvatar src={chatDefaultAvatar} fallbackSrc={chatDefaultAvatar} size={5} />
    </div>
  ),
}

export const AppearanceRingLight: Story = {
  args: {
    src: chatDefaultAvatar,
    appearance: 'ring-light',
    elevation: 'soft',
    size: 3,
  },
  render: (args) => (
    <div className="rounded-lg bg-[url(https://picsum.photos/400/200)] bg-cover p-4">
      <CwAvatar {...args} />
    </div>
  ),
}

export const AppearanceRingLightStrong: Story = {
  args: {
    src: chatDefaultAvatar,
    appearance: 'ring-light',
    elevation: 'strong',
    size: 3,
  },
  render: (args) => (
    <div className="rounded-lg bg-neutral-900 p-4">
      <CwAvatar {...args} />
    </div>
  ),
}

export const AppearanceRingBordered: Story = {
  args: {
    src: chatDefaultAvatar,
    appearance: 'ring-bordered',
    shape: 'square',
    size: 3,
  },
}

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CwAvatar src={chatDefaultAvatar} fallbackSrc={chatDefaultAvatar} shape="circle" />
      <CwAvatar
        src={chatDefaultAvatar}
        fallbackSrc={chatDefaultAvatar}
        shape="square"
        appearance="ring-bordered"
      />
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="badge">
      <CwAvatar
        src={chatDefaultAvatar}
        fallbackSrc={chatDefaultAvatar}
        size={3}
        badge={
          <span
            className="flex h-3 w-3 items-center justify-center rounded-full bg-[var(--success-color-6)] ring-2 ring-[var(--bg-color-container)]"
            title="在线"
          />
        }
      />
    </SlotStorySection>
  ),
}

export const ErrorFallback: Story = {
  render: () => {
    const src = `https://invalid-url-that-does-not-exist-${Date.now()}.com/image.jpg`
    return (
      <CwAvatar src={src} fallbackSrc={chatDefaultAvatar} size={2.5} />
    )
  },
}
