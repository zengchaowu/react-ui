import type { Meta, StoryObj } from '@storybook/react'
import { CwQuickAnswer } from './CwQuickAnswer'

const meta: Meta<typeof CwQuickAnswer> = {
  title: 'Cw/CwQuickAnswer',
  component: CwQuickAnswer,
}

export default meta
type Story = StoryObj<typeof CwQuickAnswer>

export const Default: Story = {
  args: {
    children: 'CwQuickAnswer',
  },
}
