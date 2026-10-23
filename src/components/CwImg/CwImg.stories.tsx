import type { Meta, StoryObj } from '@storybook/react'
import { CwImg } from './CwImg'

const meta: Meta<typeof CwImg> = {
  title: '1. Components/Media/CwImg',
  component: CwImg,
}

export default meta
type Story = StoryObj<typeof CwImg>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: '示例图片',
    imgLoading: 'lazy',
    loadWhenVisible: false,
  },
}

export const Eager: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: '首屏图片',
    imgLoading: 'eager',
    loadWhenVisible: false,
  },
}

export const Broken: Story = {
  args: {
    src: 'https://example.invalid/not-found.png',
    alt: '加载失败示例',
    loadWhenVisible: false,
  },
}
