import type { Meta, StoryObj } from '@storybook/react'
import { TpHeroScene } from './TpHeroScene'

const meta: Meta<typeof TpHeroScene> = {
  title: 'Tp/TpHeroScene',
  component: TpHeroScene,
}

export default meta
type Story = StoryObj<typeof TpHeroScene>

export const Default: Story = {
  args: {
    children: 'TpHeroScene',
  },
}
