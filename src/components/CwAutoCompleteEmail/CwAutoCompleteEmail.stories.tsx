import type { Meta, StoryObj } from '@storybook/react'
import { CwAutoCompleteEmail } from './CwAutoCompleteEmail'

const meta: Meta<typeof CwAutoCompleteEmail> = {
  title: 'Cw/CwAutoCompleteEmail',
  component: CwAutoCompleteEmail,
}

export default meta
type Story = StoryObj<typeof CwAutoCompleteEmail>

export const Default: Story = {
  args: {
    children: 'CwAutoCompleteEmail',
  },
}
