import type { Meta, StoryObj } from '@storybook/react'
import { CwCard } from './CwCard'

const meta: Meta<typeof CwCard> = {
  title: 'Cw/CwCard',
  component: CwCard,
}

export default meta
type Story = StoryObj<typeof CwCard>

export const Default: Story = {
  args: {
    children: 'CwCard',
  },
}
