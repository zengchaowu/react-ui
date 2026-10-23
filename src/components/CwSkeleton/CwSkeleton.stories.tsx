import type { Meta, StoryObj } from '@storybook/react'
import { CwSkeleton } from './CwSkeleton'
import { numberControlArgType } from '../../storybook/argTypes'

const meta: Meta<typeof CwSkeleton> = {
  title: '1. Components/Display/CwSkeleton',
  component: CwSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '骨架屏组件，用于在内容加载时显示占位效果。支持多种形状和动画效果。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: { type: 'select' },
      options: ['circle', 'rect', 'rounded'],
      description: '骨架屏形状',
    },
    width: numberControlArgType({
      min: 0,
      step: 1,
      description: '骨架屏宽度：number 为 px；string 可为 CSS 长度（如 50%）',
    }),
    height: numberControlArgType({
      min: 0,
      step: 1,
      description: '骨架屏高度：number 为 px；string 可为 CSS 长度',
    }),
    animated: {
      control: { type: 'boolean' },
      description: '是否显示动画',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwSkeleton>

export const Circle: Story = {
  args: {
    shape: 'circle',
    width: 48,
    height: 48,
    animated: true,
  },
}

export const Rect: Story = {
  args: {
    shape: 'rect',
    width: 200,
    height: 20,
    animated: true,
  },
}

export const Rounded: Story = {
  args: {
    shape: 'rounded',
    width: 200,
    height: 20,
    animated: true,
  },
}

export const WithoutAnimation: Story = {
  args: {
    shape: 'rect',
    width: 200,
    height: 20,
    animated: false,
  },
}

export const AvatarSkeleton: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <CwSkeleton shape="circle" width={48} height={48} />
      <div className="flex flex-col gap-2">
        <CwSkeleton shape="rect" width={120} height={16} />
        <CwSkeleton shape="rect" width={80} height={14} />
      </div>
    </div>
  ),
}

export const CardSkeleton: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 border border-[var(--border-color)] rounded-lg">
      <CwSkeleton shape="rounded" width={280} height={120} />
      <div className="flex flex-col gap-2">
        <CwSkeleton shape="rect" width={200} height={16} />
        <CwSkeleton shape="rect" width={150} height={14} />
        <CwSkeleton shape="rect" width={180} height={14} />
      </div>
    </div>
  ),
}
