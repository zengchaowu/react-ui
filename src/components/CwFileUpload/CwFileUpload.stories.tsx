import type { Meta, StoryObj } from '@storybook/react'
import { CwFileUpload } from './CwFileUpload'

const meta: Meta<typeof CwFileUpload> = {
  title: '1. Components/Form/CwFileUpload',
  component: CwFileUpload,
}

export default meta
type Story = StoryObj<typeof CwFileUpload>

export const Default: Story = {
  args: {},
}
