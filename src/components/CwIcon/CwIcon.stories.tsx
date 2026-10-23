import type { Meta, StoryObj } from '@storybook/react'
import { CwIcon } from './CwIcon'

const meta: Meta<typeof CwIcon> = {
  title: '1. Components/Display/CwIcon',
  component: CwIcon,
}

export default meta
type Story = StoryObj<typeof CwIcon>

export const Default: Story = {
  args: {
    name: 'common--nav--home-line',
    size: 2,
  },
}
