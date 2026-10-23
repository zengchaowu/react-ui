import type { Meta, StoryObj } from '@storybook/react'
import { CwShareSheet } from './CwShareSheet'
import { showShareSheet } from './showShareSheet'
import type { CwShareSheetOption } from './types'

const defaultOptions: CwShareSheetOption[] = [
  {
    text: '微信好友',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png',
  },
  {
    text: '朋友圈',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat-moments.png',
  },
  {
    text: '下载名片',
    icon: 'https://img.yzcdn.cn/vant/share-sheet-link.png',
  },
]

const meta: Meta<typeof CwShareSheet> = {
  title: '1. Components/Overlay/CwShareSheet',
  component: CwShareSheet,
}

export default meta
type Story = StoryObj<typeof CwShareSheet>

export const Default: Story = {
  args: {
    title: '分享至',
    options: defaultOptions,
  },
  render: (args) => (
    <button
      type="button"
      onClick={() => {
        void showShareSheet(args)
      }}
    >
      打开分享面板
    </button>
  ),
}
