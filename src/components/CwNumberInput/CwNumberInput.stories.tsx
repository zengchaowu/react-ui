import type { Meta, StoryObj } from '@storybook/react'
import { CwNumberInput } from './CwNumberInput'

const meta: Meta<typeof CwNumberInput> = {
  title: 'Cw/CwNumberInput',
  component: CwNumberInput,
}

export default meta
type Story = StoryObj<typeof CwNumberInput>

export const Default: Story = {
  args: {
    children: 'CwNumberInput',
  },
}
