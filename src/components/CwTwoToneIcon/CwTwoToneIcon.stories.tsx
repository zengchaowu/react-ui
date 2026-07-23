import type { Meta, StoryObj } from '@storybook/react'
import { CwTwoToneIcon } from './CwTwoToneIcon'

const meta: Meta<typeof CwTwoToneIcon> = {
  title: 'Cw/CwTwoToneIcon',
  component: CwTwoToneIcon,
}

export default meta
type Story = StoryObj<typeof CwTwoToneIcon>

export const Default: Story = {
  args: {
    children: 'CwTwoToneIcon',
  },
}
