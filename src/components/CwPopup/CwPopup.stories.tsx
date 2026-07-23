import type { Meta, StoryObj } from '@storybook/react'
import { CwPopup } from './CwPopup'

const meta: Meta<typeof CwPopup> = {
  title: 'Cw/CwPopup',
  component: CwPopup,
}

export default meta
type Story = StoryObj<typeof CwPopup>

export const Default: Story = {
  args: {
    children: 'CwPopup',
  },
}
