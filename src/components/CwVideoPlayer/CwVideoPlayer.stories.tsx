import type { Meta, StoryObj } from '@storybook/react'
import { CwVideoPlayer } from './CwVideoPlayer'
import { defaultTexts } from './texts'

const meta: Meta<typeof CwVideoPlayer> = {
  title: '1. Components/Media/CwVideoPlayer',
  component: CwVideoPlayer,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    texts: defaultTexts,
    src: 'https://public-1307503455.cos.ap-guangzhou.myqcloud.com/%E6%8A%96%E9%9F%B32025926-373577.mp4',
    poster:
      'https://public-1307503455.cos.ap-guangzhou.myqcloud.com/upload/%E6%88%AA%E5%B1%8F2025-09-25%2010.00.03.png',
    controls: true,
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    fullscreen: true,
    volume: 0.8,
    showOverlay: true,
  },
  render: (args) => <CwVideoPlayer {...args} />,
}

export const CustomSize: Story = {
  args: {
    ...Default.args,
    className: 'relative w-[40rem] h-[22.5rem] overflow-hidden rounded-lg',
  },
  render: (args) => <CwVideoPlayer {...args} />,
}
