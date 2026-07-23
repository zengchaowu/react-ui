import type { Meta, StoryObj } from '@storybook/react'
import { CwResize } from './CwResize'

const meta: Meta<typeof CwResize> = {
  title: 'Cw/CwResize',
  component: CwResize,
}

export default meta
type Story = StoryObj<typeof CwResize>

export const Default: Story = {
  args: {
    children: 'CwResize',
  },
}
