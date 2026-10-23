import type { Meta, StoryObj } from '@storybook/react'
import { TpLeaflet } from './TpLeaflet'

const meta: Meta<typeof TpLeaflet> = {
  title: '2. Third Party/Map/TpLeaflet',
  component: TpLeaflet,
}

export default meta
type Story = StoryObj<typeof TpLeaflet>

export const Default: Story = {
  args: {},
}
