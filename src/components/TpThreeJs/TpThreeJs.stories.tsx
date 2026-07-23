import type { Meta, StoryObj } from '@storybook/react'
import { TpThreeJs } from './TpThreeJs'

const meta: Meta<typeof TpThreeJs> = {
  title: 'Tp/TpThreeJs',
  component: TpThreeJs,
}

export default meta
type Story = StoryObj<typeof TpThreeJs>

export const Default: Story = {
  args: {
    children: 'TpThreeJs',
  },
}
