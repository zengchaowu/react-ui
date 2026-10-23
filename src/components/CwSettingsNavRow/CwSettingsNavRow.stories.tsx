import type { Meta, StoryObj } from '@storybook/react'
import { CwSettingsNavRow } from './CwSettingsNavRow'

const meta: Meta<typeof CwSettingsNavRow> = {
  title: '1. Components/Layout/CwSettingsNavRow',
  component: CwSettingsNavRow,
}

export default meta
type Story = StoryObj<typeof CwSettingsNavRow>

export const Default: Story = {
  args: {},
}
