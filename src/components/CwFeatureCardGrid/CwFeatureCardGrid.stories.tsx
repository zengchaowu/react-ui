import type { Meta, StoryObj } from '@storybook/react'
import { CwFeatureCardGrid } from './CwFeatureCardGrid'

const meta: Meta<typeof CwFeatureCardGrid> = {
  title: '1. Components/Display/CwFeatureCardGrid',
  component: CwFeatureCardGrid,
}

export default meta
type Story = StoryObj<typeof CwFeatureCardGrid>

export const Default: Story = {
  args: {
    title: '订单',
    items: [
      { key: 'download', label: '下载', icon: 'common--action--download-line' },
      { key: 'upload', label: '上传', icon: 'common--action--upload-line' },
      { key: 'share', label: '分享', icon: 'common--action--share-line' },
    ],
  },
}
