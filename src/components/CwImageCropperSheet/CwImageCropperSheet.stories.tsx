import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CwButton } from '../CwButton'
import { showImageCropperSheet, type ShowImageCropperSheetOptions } from './showImageCropperSheet'
import type { CwImageCropperSheetProps } from './types'

const meta: Meta<CwImageCropperSheetProps> = {
  title: '1. Components/Overlay/CwImageCropperSheet',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "图片裁剪 Sheet 的函数式 API：showImageCropperSheet(options) -> Promise<Blob | 'cancel'>",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    aspectRatio: {
      control: { type: 'object' },
      description: '裁剪框的宽高比，例如 [1, 1] 表示正方形',
    },
    disabled: {
      control: { type: 'boolean' },
      description: '是否禁用',
    },
    readonly: {
      control: { type: 'boolean' },
      description: '是否只读',
    },
    quality: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 },
      description: '输出图片质量（0-1）',
    },
    outputFormat: {
      control: { type: 'select' },
      options: ['image/png', 'image/jpeg', 'image/webp'],
      description: '输出图片格式',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

function CropperDemo({
  args,
  square = false,
}: {
  args: Story['args']
  square?: boolean
}) {
  const [previewUrl, setPreviewUrl] = useState('')

  const handleShow = async () => {
    if (args?.disabled) return
    const options: ShowImageCropperSheetOptions = square
      ? { ...args, aspectRatio: [1, 1] }
      : { ...args }
    try {
      const result = await showImageCropperSheet(options)
      if (result !== 'cancel') {
        setPreviewUrl((url) => {
          if (url) URL.revokeObjectURL(url)
          return URL.createObjectURL(result)
        })
        console.log('裁剪完成:', result)
      } else {
        console.log('取消裁剪')
      }
    } catch (error) {
      console.error('裁剪错误:', error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <CwButton type="primary" disabled={args?.disabled} onClick={handleShow}>
        {square ? '选择图片（正方形裁剪）' : '选择图片'}
      </CwButton>

      {previewUrl ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--text-color-secondary)] mb-2">
            {square ? '裁剪结果预览（正方形）：' : '裁剪结果预览：'}
          </p>
          <img
            src={previewUrl}
            alt="裁剪后的图片"
            className={
              square
                ? 'w-64 h-64 object-cover border border-[var(--border-color)] rounded-lg'
                : 'max-w-xs max-h-xs border border-[var(--border-color)] rounded-lg'
            }
          />
        </div>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: {
    aspectRatio: undefined,
    disabled: false,
    readonly: false,
    quality: 0.9,
    outputFormat: 'image/png',
  },
  render: (args) => <CropperDemo args={args} />,
}

export const SquareCrop: Story = {
  args: {
    aspectRatio: [1, 1],
    disabled: false,
    readonly: false,
    quality: 0.9,
    outputFormat: 'image/png',
  },
  render: (args) => <CropperDemo args={args} square />,
}

function DisabledDemo({ args }: { args: Story['args'] }) {
  const handleShow = async () => {
    if (args?.disabled) return
    try {
      await showImageCropperSheet(args as ShowImageCropperSheetOptions)
    } catch (error) {
      console.error('裁剪错误:', error)
    }
  }

  return (
    <div className="p-4">
      <CwButton type="primary" disabled={args?.disabled} onClick={handleShow}>
        选择图片（已禁用）
      </CwButton>
    </div>
  )
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <DisabledDemo args={args} />,
}
