import type { Meta, StoryObj } from '@storybook/react'
import type { CloudDiskNode } from '@zengchaowu/shared/types/cloud-disk'
import { CwCloudDiskNodeThumb } from './CwCloudDiskNodeThumb'

const folderNode = {
  id: 'folder-1',
  name: 'Documents',
  kind: 'folder',
} as CloudDiskNode

const fileNode = {
  id: 'file-1',
  name: 'readme.md',
  kind: 'file',
  mime_type: 'text/markdown',
} as CloudDiskNode

const meta: Meta<typeof CwCloudDiskNodeThumb> = {
  title: '1. Components/Media/CwCloudDiskNodeThumb',
  component: CwCloudDiskNodeThumb,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Cloud-disk node thumbnail: folder icon, image preview, or file icon.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    folderIconSize: {
      control: { type: 'number', min: 0, step: 0.25 },
      description: '文件夹图标边长（rem）',
    },
    fileIconSize: {
      control: { type: 'number', min: 0, step: 0.25 },
      description: '文件图标边长（rem）',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Folder: Story = {
  args: {
    node: folderNode,
    resolvePreviewUrl: async () => null,
    folderIconSize: 2,
  },
}

export const File: Story = {
  args: {
    node: fileNode,
    resolvePreviewUrl: async () => null,
    fileIconSize: 2,
  },
}
