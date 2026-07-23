import type { Meta, StoryObj } from '@storybook/react'
import { CwDataTable } from './CwDataTable'

const meta: Meta<typeof CwDataTable> = {
  title: 'Cw/CwDataTable',
  component: CwDataTable,
}

export default meta
type Story = StoryObj<typeof CwDataTable>

export const Default: Story = {
  args: {
    children: 'CwDataTable',
  },
}
