import type { Meta, StoryObj } from '@storybook/react'
import { CwWaterfall } from './CwWaterfall'

const meta: Meta<typeof CwWaterfall> = {
  title: 'Cw/CwWaterfall',
  component: CwWaterfall,
}

export default meta
type Story = StoryObj<typeof CwWaterfall>

export const Default: Story = {
  args: {
    children: 'CwWaterfall',
  },
}
