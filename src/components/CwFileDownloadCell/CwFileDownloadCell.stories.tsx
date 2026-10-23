import type { Meta, StoryObj } from '@storybook/react'
import { CwFileDownloadCell } from './CwFileDownloadCell'

const meta: Meta<typeof CwFileDownloadCell> = {
  title: '1. Components/Media/CwFileDownloadCell',
  component: CwFileDownloadCell,
}

export default meta
type Story = StoryObj<typeof CwFileDownloadCell>

export const Downloading: Story = {
  args: {
    fileName: '项目提案.pdf',
    fileSize: '2.5 MB',
    progress: 62,
  },
}

export const Downloadable: Story = {
  args: {
    fileName: '技术文档.docx',
    fileSize: '856 KB',
  },
}
