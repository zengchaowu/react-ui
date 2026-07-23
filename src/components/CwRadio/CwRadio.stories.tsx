import type { Meta, StoryObj } from '@storybook/react'
import { CwRadio } from './CwRadio'

const meta: Meta<typeof CwRadio> = {
  title: 'Cw/CwRadio',
  component: CwRadio,
}

export default meta
type Story = StoryObj<typeof CwRadio>

export const Default: Story = {
  args: {
    children: 'CwRadio',
  },
}
