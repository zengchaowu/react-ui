import type { Meta, StoryObj } from '@storybook/react'
import { CwSettingsPage } from './CwSettingsPage'

const meta: Meta<typeof CwSettingsPage> = {
  title: '1. Components/Layout/CwSettingsPage',
  component: CwSettingsPage,
}

export default meta
type Story = StoryObj<typeof CwSettingsPage>

export const Default: Story = {
  args: {},
}
