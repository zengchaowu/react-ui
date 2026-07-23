import type { Meta, StoryObj } from '@storybook/react'
import { CwSlider } from './CwSlider'

const meta: Meta<typeof CwSlider> = {
  title: 'Cw/CwSlider',
  component: CwSlider,
}

export default meta
type Story = StoryObj<typeof CwSlider>

export const Default: Story = {
  args: {
    children: 'CwSlider',
  },
}
