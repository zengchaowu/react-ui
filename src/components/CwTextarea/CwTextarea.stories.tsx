import type { Meta, StoryObj } from '@storybook/react'
import { CwTextarea } from './CwTextarea'

const meta: Meta<typeof CwTextarea> = {
  title: 'Cw/CwTextarea',
  component: CwTextarea,
}

export default meta
type Story = StoryObj<typeof CwTextarea>

export const Default: Story = {
  args: {
    children: 'CwTextarea',
  },
}
