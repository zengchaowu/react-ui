import type { Meta, StoryObj } from '@storybook/react'
import { CwConfigCard } from './CwConfigCard'

const meta: Meta<typeof CwConfigCard> = {
  title: 'Cw/CwConfigCard',
  component: CwConfigCard,
}

export default meta
type Story = StoryObj<typeof CwConfigCard>

export const Default: Story = {
  args: {
    children: 'CwConfigCard',
  },
}
