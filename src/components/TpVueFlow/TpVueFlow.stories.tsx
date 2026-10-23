import type { Meta, StoryObj } from '@storybook/react'
import { TpVueFlow } from './TpVueFlow'

const meta: Meta<typeof TpVueFlow> = {
  title: '2. Third Party/Diagram/TpVueFlow',
  component: TpVueFlow,
}

export default meta
type Story = StoryObj<typeof TpVueFlow>

export const Default: Story = {
  args: {},
}
