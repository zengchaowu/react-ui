import type { Meta, StoryObj } from '@storybook/react'
import { CwImagePreview } from './CwImagePreview'

const meta: Meta<typeof CwImagePreview> = {
  title: '1. Components/Media/CwImagePreview',
  component: CwImagePreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '基于 CwImageFit 的图片预览组件，支持缩放、旋转、拖拽，兼容 PC 和移动端（滚轮缩放、双击缩放、双指缩放/旋转）。'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: { type: 'text' },
      description: '图片源：可以是 URL 字符串、File 对象或 Blob 对象'
    },
    alt: {
      control: { type: 'text' },
      description: '图片 alt 文本'
    },
    disabled: {
      control: { type: 'boolean' }
    },
    readonly: {
      control: { type: 'boolean' }
    },
    minScale: {
      control: { type: 'number', min: 0.1, step: 0.1 }
    },
    maxScale: {
      control: { type: 'number', min: 0.5, step: 0.1 }
    },
    initialScale: {
      control: { type: 'number', min: 0.1, step: 0.1 }
    },
    initialRotation: {
      control: { type: 'number', min: -360, max: 360, step: 15 }
    },
    enableDoubleClickZoom: {
      control: { type: 'boolean' }
    },
    enableWheelZoom: {
      control: { type: 'boolean' }
    },
    enableDrag: {
      control: { type: 'boolean' }
    },
    allowDragWhenNotScaled: {
      control: { type: 'boolean' },
      description: '即使缩放比例不大于 1 也允许拖拽平移'
    },
    enablePinchZoom: {
      control: { type: 'boolean' }
    },
    enablePinchRotate: {
      control: { type: 'boolean' }
    }
  }
}

export default meta
type Story = StoryObj<typeof CwImagePreview>

export const Default: Story = {
  args: {
    src: 'https://img.yzcdn.cn/vant/cat.jpeg',
    alt: '示例图片',
    initialScale: 1,
    allowDragWhenNotScaled: true,
    className: 'relative w-screen h-screen',
  },
  render: (args) => (
    <div className="relative w-screen h-screen">
      <CwImagePreview {...args} />
    </div>
  ),
}
