import type { Meta, StoryObj } from '@storybook/react'
import { CwMobileStackShell } from './CwMobileStackShell'

const meta: Meta<typeof CwMobileStackShell> = {
  title: 'Cw/CwMobileStackShell',
  component: CwMobileStackShell,
}

export default meta
type Story = StoryObj<typeof CwMobileStackShell>

export const Default: Story = {
  args: {
    children: 'CwMobileStackShell',
  },
}
