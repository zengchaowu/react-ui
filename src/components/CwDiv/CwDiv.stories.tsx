import type { Meta, StoryObj } from '@storybook/react'
import { CwDiv } from './CwDiv'

const meta: Meta<typeof CwDiv> = {
  title: 'Cw/CwDiv',
  component: CwDiv,
}

export default meta
type Story = StoryObj<typeof CwDiv>

export const Default: Story = {
  args: {
    children: 'CwDiv',
  },
}
