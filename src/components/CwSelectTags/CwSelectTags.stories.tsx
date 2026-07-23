import type { Meta, StoryObj } from '@storybook/react'
import { CwSelectTags } from './CwSelectTags'

const meta: Meta<typeof CwSelectTags> = {
  title: 'Cw/CwSelectTags',
  component: CwSelectTags,
}

export default meta
type Story = StoryObj<typeof CwSelectTags>

export const Default: Story = {
  args: {
    children: 'CwSelectTags',
  },
}
