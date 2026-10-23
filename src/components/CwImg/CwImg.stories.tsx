import type { Meta, StoryObj } from '@storybook/react'
import { CwImg } from './CwImg'

const meta: Meta<typeof CwImg> = {
  title: '1. Components/Media/CwImg',
  component: CwImg,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '图片组件，支持加载状态和错误状态。加载失败时显示错误图标。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: { type: 'text' },
      description: '图片地址',
    },
    alt: {
      control: { type: 'text' },
      description: '图片替代文本',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwImg>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200/200',
    alt: '示例图片',
    loadWhenVisible: false,
  },
  render: (args) => (
    <div className="w-64 h-64">
      <CwImg {...args} />
    </div>
  ),
}

export const Loading: Story = {
  render: () => {
    const src = 'https://picsum.photos/4000/4000?random=' + Date.now()
    return (
      <div className="w-64 h-64 border border-[var(--border-color)] rounded overflow-hidden">
        <CwImg src={src} alt="加载中的图片" loadWhenVisible={false} />
      </div>
    )
  },
}

export const Error: Story = {
  render: () => {
    // 使用一个肯定失败的 URL
    const src = 'https://invalid-url-that-does-not-exist-' + Date.now() + '.com/image.jpg'
    return (
      <div className="w-64 h-64 border border-[var(--border-color)] rounded overflow-hidden">
        <CwImg src={src} alt="加载失败的图片" loadWhenVisible={false} />
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-32 h-32 border border-[var(--border-color)] rounded">
        <CwImg src="https://picsum.photos/100/100" alt="小图片" loadWhenVisible={false} />
      </div>
      <div className="w-64 h-64 border border-[var(--border-color)] rounded">
        <CwImg src="https://picsum.photos/200/200" alt="中图片" loadWhenVisible={false} />
      </div>
      <div className="w-96 h-96 border border-[var(--border-color)] rounded">
        <CwImg src="https://picsum.photos/300/300" alt="大图片" loadWhenVisible={false} />
      </div>
    </div>
  ),
}

