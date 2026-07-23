import type { Meta, StoryObj } from '@storybook/react'
import { CwFunctionGrid } from './CwFunctionGrid'

const meta: Meta<typeof CwFunctionGrid> = {
  title: 'Cw/CwFunctionGrid',
  component: CwFunctionGrid,
}

export default meta
type Story = StoryObj<typeof CwFunctionGrid>

export const Default: Story = {
  args: {
    children: 'CwFunctionGrid',
  },
}
