import type { Meta, StoryObj } from '@storybook/react'
import { CwVoiceWaveform } from './CwVoiceWaveform'

const meta: Meta<typeof CwVoiceWaveform> = {
  title: '1. Components/Media/CwVoiceWaveform',
  component: CwVoiceWaveform,
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
