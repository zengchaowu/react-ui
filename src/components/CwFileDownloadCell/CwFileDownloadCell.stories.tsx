import type { Meta, StoryObj } from '@storybook/react'
import { CwFileDownloadCell } from './CwFileDownloadCell'

const meta: Meta<typeof CwFileDownloadCell> = {
  title: '1. Components/Media/CwFileDownloadCell',
  component: CwFileDownloadCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CwFileDownloadCell>

export const PdfDownloading: Story = {
  args: {
    fileName: '项目提案.pdf',
    fileSize: '2.5 MB',
    progress: 62,
    clickable: false,
  },
  render: (args) => (
    <div style={{ width: 520 }}>
      <CwFileDownloadCell {...args} />
    </div>
  ),
}

export const MultipleProgressStates: Story = {
  args: {},
  render: () => {
    const items = [
      { fileName: '项目提案.pdf', fileSize: '2.5 MB', progress: 15 },
      { fileName: '项目提案.pdf', fileSize: '2.5 MB', progress: 45 },
      { fileName: '项目提案.pdf', fileSize: '2.5 MB', progress: 80 },
      { fileName: '项目提案.pdf', fileSize: '2.5 MB', progress: 100 },
    ]
    return (
      <div className="flex flex-col gap-2" style={{ width: 520 }}>
        {items.map((item, index) => (
          <CwFileDownloadCell key={index} {...item} />
        ))}
      </div>
    )
  },
}

export const StaticList: Story = {
  args: {},
  render: () => {
    const items = [
      { fileName: '项目提案.pdf', fileSize: '2.5 MB', progress: 62 },
      { fileName: '设计稿.png', fileSize: '1.8 MB' },
      { fileName: '演示视频.mp4', fileSize: '45.2 MB' },
      { fileName: '会议录音.mp3', fileSize: '12.4 MB' },
      { fileName: '项目文件.zip', fileSize: '156 MB' },
      { fileName: '技术文档.docx', fileSize: '856 KB' },
    ]
    return (
      <div className="flex flex-col gap-2" style={{ width: 520 }}>
        {items.map((item) => (
          <CwFileDownloadCell key={item.fileName} {...item} />
        ))}
      </div>
    )
  },
}

