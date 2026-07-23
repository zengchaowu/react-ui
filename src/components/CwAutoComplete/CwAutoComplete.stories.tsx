import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoComplete } from './CwAutoComplete'

const meta: Meta<typeof CwAutoComplete> = {
  title: 'Cw/CwAutoComplete',
  component: CwAutoComplete,
}

export default meta
type Story = StoryObj<typeof CwAutoComplete>

export const Default: Story = {
  args: {
    children: 'CwAutoComplete',
  },
}
