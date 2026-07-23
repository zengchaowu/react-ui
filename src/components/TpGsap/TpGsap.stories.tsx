import type { Meta, StoryObj } from '@storybook/react'
import { TpGsap } from './TpGsap'

const meta: Meta<typeof TpGsap> = {
  title: 'Tp/TpGsap',
  component: TpGsap,
}

export default meta
type Story = StoryObj<typeof TpGsap>

export const Default: Story = {
  args: {
    children: 'TpGsap',
  },
}
