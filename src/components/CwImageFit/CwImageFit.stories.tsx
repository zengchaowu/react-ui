import type { Meta, StoryObj } from '@storybook/react'
import { CwImageFit } from './CwImageFit'

const meta: Meta<typeof CwImageFit> = {
  title: '1. Components/Media/CwImageFit',
  component: CwImageFit,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '一个图片自适应容器组件，无论容器大小如何变化，图片都能完全显示在容器内。支持 URL、File 和 Blob 类型的图片源。'
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
    }
  }
}

export default meta
type Story = StoryObj<typeof CwImageFit>

export const Default: Story = {
  args: {
    src: 'https://img.yzcdn.cn/vant/cat.jpeg',
    alt: '示例图片',
  },
  render: (args) => (
    <div className="relative w-[100vw] h-[100vh]">
      <CwImageFit {...args} />
    </div>
  ),
}

