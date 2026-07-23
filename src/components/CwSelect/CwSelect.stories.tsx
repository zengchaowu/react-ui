import type { Meta, StoryObj } from '@storybook/react'
import { CwSelect } from './CwSelect'

const meta: Meta<typeof CwSelect> = {
  title: 'Cw/CwSelect',
  component: CwSelect,
}

export default meta
type Story = StoryObj<typeof CwSelect>

export const Default: Story = {
  args: {
    children: 'CwSelect',
  },
}
