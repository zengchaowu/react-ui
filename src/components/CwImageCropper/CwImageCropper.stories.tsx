import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwImageCropper } from './CwImageCropper'

const meta: Meta<typeof CwImageCropper> = {
  title: '1. Components/Media/CwImageCropper',
  component: CwImageCropper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '一个图片裁剪组件，支持传入 File 对象，提供可视化的裁剪界面，支持拖拽调整裁剪区域，输出裁剪后的图片 Blob。'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    file: {
      control: { type: 'file', accept: 'image/*' }
    },
    aspectRatio: {
      control: { type: 'object' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    readonly: {
      control: { type: 'boolean' }
    },
    quality: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 }
    },
    outputFormat: {
      control: { type: 'select' },
      options: ['image/png', 'image/jpeg', 'image/webp']
    }
  }
}

export default meta
type Story = StoryObj<typeof CwImageCropper>

export const Default: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | undefined>(undefined)

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.files?.[0]
      if (next) setFile(next)
    }

    const handleCrop = (blob: Blob) => {
      console.log('裁剪完成:', blob)
    }

    const handleCancel = () => {
      console.log('取消裁剪')
    }

    const handleError = (error: Error) => {
      console.error('裁剪错误:', error)
    }

    return (
      <div className="relative w-[100vw] h-[100vh] flex flex-col">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm"
        />
        <CwImageCropper
          className="flex-grow"
          {...args}
          file={file}
          onCrop={handleCrop}
          onCancel={handleCancel}
          onError={handleError}
        />
      </div>
    )
  },
}
