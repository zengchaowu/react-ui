import type { Meta, StoryObj } from '@storybook/react'
import { TpSkiaCanvas } from './TpSkiaCanvas'

const meta: Meta<typeof TpSkiaCanvas> = {
  title: 'Tp/TpSkiaCanvas',
  component: TpSkiaCanvas,
}

export default meta
type Story = StoryObj<typeof TpSkiaCanvas>

export const Default: Story = {
  args: {
    children: 'TpSkiaCanvas',
  },
}
