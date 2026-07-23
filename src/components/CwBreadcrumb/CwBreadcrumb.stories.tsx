import type { Meta, StoryObj } from '@storybook/react'
import { CwBreadcrumb } from './CwBreadcrumb'

const meta: Meta<typeof CwBreadcrumb> = {
  title: 'Cw/CwBreadcrumb',
  component: CwBreadcrumb,
}

export default meta
type Story = StoryObj<typeof CwBreadcrumb>

export const Default: Story = {
  args: {
    children: 'CwBreadcrumb',
  },
}
