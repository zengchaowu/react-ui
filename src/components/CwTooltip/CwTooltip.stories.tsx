import type { Meta, StoryObj } from '@storybook/react'
import { CwTooltip } from './CwTooltip'

const meta: Meta<typeof CwTooltip> = {
  title: 'Cw/CwTooltip',
  component: CwTooltip,
}

export default meta
type Story = StoryObj<typeof CwTooltip>

export const Default: Story = {
  args: {
    children: 'CwTooltip',
  },
}
