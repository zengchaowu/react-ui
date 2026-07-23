import type { Meta, StoryObj } from '@storybook/react'
import { CwVoiceWaveform } from './CwVoiceWaveform'

const meta: Meta<typeof CwVoiceWaveform> = {
  title: 'Cw/CwVoiceWaveform',
  component: CwVoiceWaveform,
}

export default meta
type Story = StoryObj<typeof CwVoiceWaveform>

export const Default: Story = {
  args: {
    children: 'CwVoiceWaveform',
  },
}
