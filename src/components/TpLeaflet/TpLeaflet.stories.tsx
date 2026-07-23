import type { Meta, StoryObj } from '@storybook/react'
import { TpLeaflet } from './TpLeaflet'

const meta: Meta<typeof TpLeaflet> = {
  title: 'Tp/TpLeaflet',
  component: TpLeaflet,
}

export default meta
type Story = StoryObj<typeof TpLeaflet>

export const Default: Story = {
  args: {
    children: 'TpLeaflet',
  },
}
