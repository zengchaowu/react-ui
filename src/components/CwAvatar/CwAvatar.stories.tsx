import type { Meta, StoryObj } from '@storybook/react'
import { CwAvatar } from './CwAvatar'

const meta: Meta<typeof CwAvatar> = {
  title: 'Cw/CwAvatar',
  component: CwAvatar,
}

export default meta
type Story = StoryObj<typeof CwAvatar>

export const Default: Story = {
  args: {
    children: 'CwAvatar',
  },
}
