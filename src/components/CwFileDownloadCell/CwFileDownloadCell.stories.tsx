import type { Meta, StoryObj } from '@storybook/react'
import { CwFileDownloadCell } from './CwFileDownloadCell'

const meta: Meta<typeof CwFileDownloadCell> = {
  title: 'Cw/CwFileDownloadCell',
  component: CwFileDownloadCell,
}

export default meta
type Story = StoryObj<typeof CwFileDownloadCell>

export const Default: Story = {
  args: {
    children: 'CwFileDownloadCell',
  },
}
