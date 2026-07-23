import type { Meta, StoryObj } from '@storybook/react'
import { CwTabbar } from './CwTabbar'

const meta: Meta<typeof CwTabbar> = {
  title: 'Cw/CwTabbar',
  component: CwTabbar,
}

export default meta
type Story = StoryObj<typeof CwTabbar>

export const Default: Story = {
  args: {
    children: 'CwTabbar',
  },
}
