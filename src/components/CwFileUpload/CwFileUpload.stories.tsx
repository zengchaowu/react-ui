import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SlotStorySection } from '../../storybook/SlotStorySection'
import { withSlotsStoryParameters } from '../../storybook/slotStory'
import { storybookPlaceholderImage } from '../../storybook/placeholderImage'
import { CwFileUpload } from './CwFileUpload'
import type { CwFileUploadProps, UploadFile } from './types'

const meta: Meta<typeof CwFileUpload> = {
  title: '1. Components/Form/CwFileUpload',
  component: CwFileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    accept: { control: { type: 'text' } },
    multiple: { control: { type: 'boolean' } },
    maxCount: { control: { type: 'number' } },
    deletable: { control: { type: 'boolean' } },
    showUploadArea: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
  },
}

export default meta
type Story = StoryObj<typeof CwFileUpload>

function toUploadFiles(files: File[]): UploadFile[] {
  return files.map((f) => ({
    uid: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: f.name,
    size: f.size,
    type: f.type || 'application/octet-stream',
    // Story 无实际上传管线，直接 success，避免一直盖着 ready 遮罩
    status: 'success',
    url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    file: f,
  }))
}

function FileUploadDemo({
  args,
  initialFiles = [],
}: {
  args: CwFileUploadProps
  initialFiles?: UploadFile[]
}) {
  const [files, setFiles] = useState<UploadFile[]>(initialFiles)

  const handleSelect = (selected: File[]) => {
    const next = [...files, ...toUploadFiles(selected)]
    // 按 args.maxCount 截断
    const limit = typeof args.maxCount === 'number' ? args.maxCount : next.length
    setFiles(next.slice(0, limit))
  }

  const handleRemove = (file: UploadFile) => {
    setFiles((prev) => prev.filter((f) => f.uid !== file.uid))
  }

  return (
    <CwFileUpload
      {...args}
      value={files}
      onChange={setFiles}
      onSelect={handleSelect}
      onRemove={handleRemove}
    />
  )
}

const initialFilesDemo: UploadFile[] = [
  {
    uid: 'init_1',
    name: 'landscape.jpg',
    size: 7716,
    type: 'image/jpeg',
    status: 'success',
    url: storybookPlaceholderImage(200, 200, 0),
    file: new File([new Blob()], 'landscape.jpg', { type: 'image/jpeg' }),
  },
  {
    uid: 'init_2',
    name: 'avatar.png',
    size: 40895,
    type: 'image/png',
    status: 'uploading',
    url: storybookPlaceholderImage(200, 200, 1),
    file: new File([new Blob()], 'avatar.png', { type: 'image/png' }),
  },
  {
    uid: 'init_3',
    name: '合同草案.pdf',
    size: 20480,
    type: 'application/pdf',
    status: 'success',
    file: new File([new Blob()], '合同草案.pdf', { type: 'application/pdf' }),
  },
  {
    uid: 'init_4',
    name: '会议纪要.docx',
    size: 12288,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'ready',
    file: new File(
      [new Blob()],
      '会议纪要.docx',
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    ),
  },
]

const slotStoryBaseArgs = {
  accept: 'image/*',
  multiple: true,
  showUploadArea: true,
  deletable: true,
}

const demoUploadFile: UploadFile = {
  uid: 'slot-demo-1',
  name: '示例图.png',
  size: 1200,
  type: 'image/png',
  status: 'success',
  url: storybookPlaceholderImage(120, 120, 0),
  file: new File([new Blob()], '示例图.png', { type: 'image/png' }),
}

function UploadAreaSlotDemo() {
  const [files, setFiles] = useState<UploadFile[]>([])
  return (
    <CwFileUpload
      {...slotStoryBaseArgs}
      value={files}
      onChange={setFiles}
      onSelect={(selected) => setFiles((prev) => [...prev, ...toUploadFiles(selected)])}
      onRemove={(file) => setFiles((prev) => prev.filter((f) => f.uid !== file.uid))}
      uploadArea={
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] px-4 py-6 text-center">
          <span className="text-sm text-[var(--text-color-primary)]">点击或拖拽上传</span>
          <span className="text-xs text-[var(--text-color-placeholder)]">仅演示 #uploadArea</span>
        </div>
      }
    />
  )
}

function ActionsSlotDemo() {
  const [files, setFiles] = useState<UploadFile[]>([demoUploadFile])
  return (
    <CwFileUpload
      {...slotStoryBaseArgs}
      showUploadArea={false}
      value={files}
      onChange={setFiles}
      onSelect={(selected) => setFiles((prev) => [...prev, ...toUploadFiles(selected)])}
      onRemove={(file) => setFiles((prev) => prev.filter((f) => f.uid !== file.uid))}
      actions={(file) => (
        <div
          role="button"
          tabIndex={0}
          className="text-xs text-[var(--brand-color-6)]"
          onClick={(event) => {
            event.stopPropagation()
            console.log('preview', file.name)
          }}
        >
          预览
        </div>
      )}
    />
  )
}

export const Default: Story = {
  args: {
    // 不限图片，便于验证非图片：CwFileIcon + 文件名 + 删除
    accept: undefined,
    multiple: true,
    deletable: true,
    showUploadArea: true,
  },
  render: (args) => <FileUploadDemo {...args} />,
}

export const WithInitialFiles: Story = {
  args: {
    accept: undefined,
    multiple: true,
  },
  render: (args) => <FileUploadDemo args={args} initialFiles={initialFilesDemo} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
    deletable: true,
  },
  render: (args) => <FileUploadDemo {...args} />,
}

export const Readonly: Story = {
  args: {
    readonly: true,
    deletable: false,
  },
  render: (args) => <FileUploadDemo {...args} />,
}

export const WithSlots: Story = {
  parameters: withSlotsStoryParameters,
  render: () => (
    <div className="flex w-[20rem] flex-col gap-10">
      <SlotStorySection slot="uploadArea">
        <UploadAreaSlotDemo />
      </SlotStorySection>
      <SlotStorySection slot="actions">
        <ActionsSlotDemo />
      </SlotStorySection>
    </div>
  ),
}

export const LimitCount: Story = {
  args: {
    maxCount: 3,
    multiple: true,
  },
  render: (args) => <FileUploadDemo {...args} />,
}
