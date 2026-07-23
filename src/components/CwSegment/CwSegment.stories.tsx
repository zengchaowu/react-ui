import type { Meta, StoryObj } from '@storybook/react'
import { CwSegment } from './CwSegment'

const meta: Meta<typeof CwSegment> = {
  title: 'Cw/CwSegment',
  component: CwSegment,
}

export default meta
type Story = StoryObj<typeof CwSegment>

export const Default: Story = {
  args: {
    children: 'CwSegment',
  },
}
