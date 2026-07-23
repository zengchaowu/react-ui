import type { Meta, StoryObj } from '@storybook/react'
import { CwCountDownButton } from './CwCountDownButton'

const meta: Meta<typeof CwCountDownButton> = {
  title: 'Cw/CwCountDownButton',
  component: CwCountDownButton,
}

export default meta
type Story = StoryObj<typeof CwCountDownButton>

export const Default: Story = {
  args: {
    children: 'CwCountDownButton',
  },
}
