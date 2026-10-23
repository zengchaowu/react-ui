import type { Meta, StoryObj } from '@storybook/react'
import { CwBadge } from './CwBadge'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { defaultTexts } from './texts'

const meta: Meta<typeof CwBadge> = {
  title: '1. Components/Display/CwBadge',
  component: CwBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '徽章组件，用于展示消息提醒、数字或状态。可以通过父组件的样式控制位置。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: { type: 'text' },
      description: '徽章内容（数字或文字）',
    },
    dot: {
      control: { type: 'boolean' },
      description: '是否显示为点状徽章',
    },
    max: {
      control: { type: 'number' },
      description: '数字最大值，超过最大值会显示 {max}+',
    },
    showZero: {
      control: { type: 'boolean' },
      description: '当 content 为数字 0 时，是否展示徽标',
    },
    size: {
      control: { type: 'select' },
      options: ['xsmall', 'small', 'medium', 'large'],
      description: '徽章大小',
    },
    backgroundColor: {
      control: { type: 'text' },
      description: '背景色（支持 CSS 变量，如 var(--success-color-6)）',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwBadge>

export const Default: Story = {
  args: {
    content: 5,
    texts: defaultTexts,
  },
}

export const Dot: Story = {
  args: {
    dot: true,
    texts: defaultTexts,
  },
}

export const Number: Story = {
  args: {
    content: 99,
    texts: defaultTexts,
  },
}

export const MaxNumber: Story = {
  args: {
    content: 150,
    max: 99,
    texts: defaultTexts,
  },
}

export const Text: Story = {
  args: {
    content: 'New',
    texts: defaultTexts,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-8 items-center">
      <CwBadge content="5" size="xsmall" />
      <CwBadge content="5" size="small" />
      <CwBadge content="5" size="medium" />
      <CwBadge content="5" size="large" />
    </div>
  ),
}

export const CustomBackground: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <CwBadge dot backgroundColor="var(--success-color-6)" />
      <CwBadge content="3" backgroundColor="var(--brand-color-6)" />
      <CwBadge content="!" backgroundColor="var(--warning-color-6)" size="small" />
    </div>
  ),
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <SlotStorySection slot="default">
      <CwBadge content={3}>
        <span className="inline-flex rounded-md bg-[var(--bg-color-component)] px-3 py-1.5 text-sm text-[var(--text-color-primary)]">
          消息
        </span>
      </CwBadge>
    </SlotStorySection>
  ),
}

export const AppearanceAvatarUnread: Story = {
  render: () => (
    <div className="relative inline-flex h-12 w-12 rounded-lg bg-[var(--bg-color-component)]">
      <CwBadge appearance="corner-dot" content={3} />
    </div>
  ),
}

export const ShowZero: Story = {
  render: () => <CwBadge content={0} showZero />,
}
