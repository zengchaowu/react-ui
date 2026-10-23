import type { Meta, StoryObj } from '@storybook/react'
import { CwIndicator } from './CwIndicator'

const meta: Meta<typeof CwIndicator> = {
  title: '1. Components/Display/CwIndicator',
  component: CwIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '进度指示器组件，支持小数进度。从当前点出发一条线连接到下一个点，连接完成后线条收缩。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    total: {
      control: { type: 'number', min: 2, max: 10 },
      description: '总点数',
    },
    value: {
      control: { type: 'number', min: 0, max: 10, step: 0.1 },
      description: '当前进度值（支持小数）',
    },
    dotSize: {
      control: { type: 'number', min: 4, max: 20 },
      description: '点的大小（像素）',
    },
    dotSpacing: {
      control: { type: 'number', min: 8, max: 40 },
      description: '点之间的间距（像素）',
    },
    maxWidth: {
      control: { type: 'number', min: 0, step: 8 },
      description: '可滚动时的最大宽度（px）',
    },
    itemSize: {
      control: { type: 'number', min: 0, step: 1 },
      description: 'numbered 项尺寸（px）',
    },
    itemSpacing: {
      control: { type: 'number', min: 0, step: 1 },
      description: 'numbered 项间距（px）',
    },
    activeColor: {
      control: { type: 'color' },
      description: '高亮颜色',
    },
    inactiveColor: {
      control: { type: 'color' },
      description: '未激活点的颜色',
    },
    lineColor: {
      control: { type: 'color' },
      description: '连接线的颜色',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    total: 5,
    value: 1.5,
    dotSize: 8,
    dotSpacing: 16,
  },
}

export const NumberedScrollable: Story = {
  args: {
    total: 20,
    value: 9,
    variant: 'numbered',
    scrollable: 'auto',
    maxWidth: 320,
    itemSize: 20,
    itemSpacing: 4,
    inactiveColor: 'var(--bg-color-component)',
  },
}
