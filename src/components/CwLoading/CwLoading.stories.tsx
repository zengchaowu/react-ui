import type { Meta, StoryObj } from '@storybook/react'
import { CwLoading } from './CwLoading'

const meta: Meta<typeof CwLoading> = {
  title: '1. Components/Display/CwLoading',
  component: CwLoading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '加载组件，用于展示加载状态。支持多种加载动画类型和尺寸。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['spinner', 'dots', 'bars'],
      description: '加载类型',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '加载器大小',
    },
    appearance: {
      control: { type: 'select' },
      options: [
        'default',
        'currentColor',
        'inverse',
        'inverseTiny',
        'treeInline',
        'mutedInline',
        'inlineText',
      ],
      description: '场景外观',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwLoading>

export const Default: Story = {
  args: {
    type: 'spinner',
    size: 'medium',
  },
}

export const Spinner: Story = {
  args: {
    type: 'spinner',
    size: 'medium',
  },
}

export const Dots: Story = {
  args: {
    type: 'dots',
    size: 'medium',
  },
}

export const Bars: Story = {
  args: {
    type: 'bars',
    size: 'medium',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <CwLoading type="spinner" size="small" />
      <CwLoading type="spinner" size="medium" />
      <CwLoading type="spinner" size="large" />
    </div>
  ),
}

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <CwLoading type="spinner" />
      <CwLoading type="dots" />
      <CwLoading type="bars" />
    </div>
  ),
}

export const AppearanceCurrentColor: Story = {
  args: { appearance: 'currentColor' },
  render: (args) => (
    <div className="text-[var(--brand-color-6)]">
      <CwLoading {...args} />
    </div>
  ),
}

export const AppearanceInverse: Story = {
  args: { appearance: 'inverse' },
  render: (args) => (
    <div className="rounded-md bg-[var(--brand-color-6)] px-4 py-2">
      <CwLoading {...args} />
    </div>
  ),
}

export const AppearanceInverseTiny: Story = {
  args: { appearance: 'inverseTiny' },
  render: (args) => (
    <div className="rounded-md bg-[var(--brand-color-6)] px-3 py-1.5">
      <CwLoading {...args} />
    </div>
  ),
}

export const AppearanceTreeInline: Story = {
  args: { appearance: 'treeInline' },
}

export const AppearanceMutedInline: Story = {
  args: { appearance: 'mutedInline' },
}

export const AppearanceInlineText: Story = {
  args: { appearance: 'inlineText' },
}
