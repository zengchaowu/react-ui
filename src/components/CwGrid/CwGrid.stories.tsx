import type { Meta, StoryObj } from '@storybook/react'
import { CwGrid } from './CwGrid'

const meta: Meta<typeof CwGrid> = {
  title: 'Cw/CwGrid',
  component: CwGrid,
}

export default meta
type Story = StoryObj<typeof CwGrid>

export const Default: Story = {
  args: {
    children: 'CwGrid',
  },
}
