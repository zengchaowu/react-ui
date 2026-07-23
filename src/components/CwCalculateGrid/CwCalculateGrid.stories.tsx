import type { Meta, StoryObj } from '@storybook/react'
import { CwCalculateGrid } from './CwCalculateGrid'

const meta: Meta<typeof CwCalculateGrid> = {
  title: 'Cw/CwCalculateGrid',
  component: CwCalculateGrid,
}

export default meta
type Story = StoryObj<typeof CwCalculateGrid>

export const Default: Story = {
  args: {
    children: 'CwCalculateGrid',
  },
}
