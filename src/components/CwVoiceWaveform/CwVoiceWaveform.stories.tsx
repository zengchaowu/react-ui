import type { Meta, StoryObj } from '@storybook/react'
import { CwVoiceWaveform } from './CwVoiceWaveform'

const meta: Meta<typeof CwVoiceWaveform> = {
  title: '1. Components/Media/CwVoiceWaveform',
  component: CwVoiceWaveform,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '语音波形可视化；传入 levels 时按音量渲染，否则展示装饰性动画。柱宽/间距/高度分别用 barWidth、barGap、height 控制。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    barCount: {
      control: { type: 'range', min: 4, max: 24, step: 1 },
      description: '柱数量',
    },
    barWidth: {
      control: { type: 'range', min: 1, max: 12, step: 1 },
      description: '单根柱宽度（px）',
    },
    barGap: {
      control: { type: 'range', min: 0, max: 12, step: 1 },
      description: '柱间距（px）',
    },
    height: {
      control: { type: 'range', min: 1, max: 6, step: 0.25 },
      description: '波形区域高度（rem）',
    },
    minHeightRatio: {
      control: { type: 'range', min: 0.05, max: 1, step: 0.01 },
      description: '柱最小高度比例（0~1）',
    },
    maxHeightRatio: {
      control: { type: 'range', min: 0.05, max: 1, step: 0.01 },
      description: '柱最大高度比例（0~1）',
    },
    levels: {
      control: 'object',
      description: '每根柱高度比例；留空时为装饰动画',
    },
    barClass: { control: 'text', description: '柱额外 class（颜色等）' },
    rootClass: { control: 'text', description: '根容器额外 class' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Decorative: Story = {
  args: {
    barCount: 12,
    barWidth: 3,
    barGap: 3,
    height: 2.25,
    minHeightRatio: 0.22,
    maxHeightRatio: 1,
  },
}

export const WithLevels: Story = {
  args: {
    levels: [0.3, 0.55, 0.8, 0.45, 0.65, 0.9, 0.5, 0.35, 0.7, 0.4, 0.6, 0.25],
  },
}
