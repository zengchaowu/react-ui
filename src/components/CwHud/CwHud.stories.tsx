import type { Meta, StoryObj } from '@storybook/react'
import { CwHud } from './CwHud'

const meta: Meta<typeof CwHud> = {
  title: 'Cw/CwHud',
  component: CwHud,
}

export default meta
type Story = StoryObj<typeof CwHud>

export const Default: Story = {
  args: {
    children: 'CwHud',
  },
}
