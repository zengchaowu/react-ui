import type { Meta, StoryObj } from '@storybook/react'
import { CwTwoToneIcon } from './CwTwoToneIcon'

const meta: Meta<typeof CwTwoToneIcon> = {
  title: '1. Components/Display/CwTwoToneIcon',
  component: CwTwoToneIcon,
}

export default meta
type Story = StoryObj<typeof CwTwoToneIcon>

export const Default: Story = {
  args: {},
}
