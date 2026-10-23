import type { Meta, StoryObj } from '@storybook/react'
import { CwInlineRenameLabel } from './CwInlineRenameLabel'

const meta: Meta<typeof CwInlineRenameLabel> = {
  title: '1. Components/Form/CwInlineRenameLabel',
  component: CwInlineRenameLabel,
}

export default meta
type Story = StoryObj<typeof CwInlineRenameLabel>

export const Default: Story = {
  args: {},
}
