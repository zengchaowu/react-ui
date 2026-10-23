import type { Meta, StoryObj } from '@storybook/react'
import { TpGsap } from './TpGsap'

const meta: Meta<typeof TpGsap> = {
  title: '2. Third Party/3D & Graphics/TpGsap',
  component: TpGsap,
}

export default meta
type Story = StoryObj<typeof TpGsap>

export const Default: Story = {
  args: {},
}
