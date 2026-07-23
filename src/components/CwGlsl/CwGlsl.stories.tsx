import type { Meta, StoryObj } from '@storybook/react'
import { CwGlsl } from './CwGlsl'

const meta: Meta<typeof CwGlsl> = {
  title: 'Cw/CwGlsl',
  component: CwGlsl,
}

export default meta
type Story = StoryObj<typeof CwGlsl>

export const Default: Story = {
  args: {
    children: 'CwGlsl',
  },
}
