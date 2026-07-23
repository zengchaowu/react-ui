import type { Meta, StoryObj } from '@storybook/react'
import { CwForm } from './CwForm'

const meta: Meta<typeof CwForm> = {
  title: 'Cw/CwForm',
  component: CwForm,
}

export default meta
type Story = StoryObj<typeof CwForm>

export const Default: Story = {
  args: {
    children: 'CwForm',
  },
}
