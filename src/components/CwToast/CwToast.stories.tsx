import type { Meta, StoryObj } from '@storybook/react'
import { CwToast } from './CwToast'

const meta: Meta<typeof CwToast> = {
  title: 'Cw/CwToast',
  component: CwToast,
}

export default meta
type Story = StoryObj<typeof CwToast>

export const Default: Story = {
  args: {
    children: 'CwToast',
  },
}
