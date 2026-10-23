import type { Meta, StoryObj } from '@storybook/react'
import { CwImagePreview } from './CwImagePreview'

const meta: Meta<typeof CwImagePreview> = {
  title: '1. Components/Media/CwImagePreview',
  component: CwImagePreview,
  parameters: {
    layout: 'fullscreen',
  },
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
}
