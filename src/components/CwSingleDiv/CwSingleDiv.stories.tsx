import type { Meta, StoryObj } from '@storybook/react'
import { CwSingleDiv } from './CwSingleDiv'

const meta: Meta<typeof CwSingleDiv> = {
  title: 'Cw/CwSingleDiv',
  component: CwSingleDiv,
}

export default meta
type Story = StoryObj<typeof CwSingleDiv>

export const Default: Story = {
  args: {
    children: 'CwSingleDiv',
  },
}
