import type { Meta, StoryObj } from '@storybook/react'
import { CwCheckbox } from './CwCheckbox'

const meta: Meta<typeof CwCheckbox> = {
  title: 'Cw/CwCheckbox',
  component: CwCheckbox,
}

export default meta
type Story = StoryObj<typeof CwCheckbox>

export const Default: Story = {
  args: {
    children: 'CwCheckbox',
  },
}
