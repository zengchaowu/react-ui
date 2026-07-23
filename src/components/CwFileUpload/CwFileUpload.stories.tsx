import type { Meta, StoryObj } from '@storybook/react'
import { CwFileUpload } from './CwFileUpload'

const meta: Meta<typeof CwFileUpload> = {
  title: 'Cw/CwFileUpload',
  component: CwFileUpload,
}

export default meta
type Story = StoryObj<typeof CwFileUpload>

export const Default: Story = {
  args: {
    children: 'CwFileUpload',
  },
}
