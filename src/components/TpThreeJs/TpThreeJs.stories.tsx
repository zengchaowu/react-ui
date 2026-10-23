import type { Meta, StoryObj } from '@storybook/react'
import { TpThreeJs } from './TpThreeJs'

const meta: Meta<typeof TpThreeJs> = {
  title: '2. Third Party/3D & Graphics/TpThreeJs',
  component: TpThreeJs,
}

export default meta
type Story = StoryObj<typeof TpThreeJs>

export const Default: Story = {
  args: {},
}
