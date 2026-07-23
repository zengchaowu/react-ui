import type { Meta, StoryObj } from '@storybook/react'
import { CwFormCard } from './CwFormCard'

const meta: Meta<typeof CwFormCard> = {
  title: 'Cw/CwFormCard',
  component: CwFormCard,
}

export default meta
type Story = StoryObj<typeof CwFormCard>

export const Default: Story = {
  args: {
    children: 'CwFormCard',
  },
}
