import type { Meta, StoryObj } from '@storybook/react'
import { CwVideoPlayer } from './CwVideoPlayer'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwVideoPlayer/texts'
// 本地示例视频（原 COS 外链已 404，改为随包内置）
import demoVideoSrc from '../../storybook/assets/cw-video-player-demo.mp4'
import demoVideoPoster from '../../storybook/assets/cw-video-player-demo-poster.png'

const meta: Meta<typeof CwVideoPlayer> = {
  title: '1. Components/Media/CwVideoPlayer',
  component: CwVideoPlayer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '自研视频播放器组件，支持完整的播放控制功能，包括播放/暂停、进度控制、音量调节、全屏播放等。使用 Tailwind CSS 构建，提供现代化的用户界面。',
      },
    },
  },
  argTypes: {
    src: {
      control: { type: 'text' },
      description: '视频源地址',
    },
    poster: {
      control: { type: 'text' },
      description: '视频封面图片',
    },
    controls: {
      control: { type: 'boolean' },
      description: '是否显示控制栏',
    },
    autoplay: {
      control: { type: 'boolean' },
      description: '是否自动播放',
    },
    muted: {
      control: { type: 'boolean' },
      description: '是否静音',
    },
    loop: {
      control: { type: 'boolean' },
      description: '是否循环播放',
    },
    preload: {
      control: { type: 'select' },
      options: ['none', 'metadata', 'auto'],
      description: '预加载策略',
    },
    fullscreen: {
      control: { type: 'boolean' },
      description: '是否支持全屏',
    },
    volume: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: '初始音量 (0-1)',
    },
    showOverlay: {
      control: { type: 'boolean' },
      description: '是否显示加载状态和播放按钮覆盖层',
    },
    onLoadedMetadata: { action: 'loadedmetadata' },
    onTimeUpdate: { action: 'timeupdate' },
    onPlay: { action: 'play' },
    onPause: { action: 'pause' },
    onEnded: { action: 'ended' },
    onVolumeChange: { action: 'volumechange' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    texts: defaultTexts,
    src: demoVideoSrc,
    poster: demoVideoPoster,
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
