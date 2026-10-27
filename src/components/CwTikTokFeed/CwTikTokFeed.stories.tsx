import type { Meta, StoryObj } from '@storybook/react'
import { CwTikTokFeed } from './CwTikTokFeed'
import type { CwSocialActionEvent, CwTikTokFeedProps } from './types'
import type { VideoItem } from '@zengchaowu/ui-shared/components/CwTikTokFeed/types'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwTikTokFeed/texts'
import { storybookChatDefaultAvatarSrc as chatDefaultAvatar } from '../../storybook/chatDefaultAvatar'
import { storybookPlaceholderImage } from '../../storybook/placeholderImage'

// 模拟视频数据
const createMockVideo = (id: number): VideoItem => ({
  id: `video-${id}`,
  video: {
    id: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: `精彩视频 #${id}`,
    description: `这是第 ${id} 个精彩的短视频内容，展示了有趣的故事情节和精美的画面效果。`,
    tags: ['热门', '推荐', `标签${id}`],
    poster: storybookPlaceholderImage(400, 600, id),
  },
  user: {
    id: `user-${id}`,
    username: `user${id}`,
    nickname: `用户${id}`,
    avatar: chatDefaultAvatar,
    isFollowed: Math.random() > 0.5,
    isVerified: Math.random() > 0.7,
  },
  socialActions: [
    {
      key: 'like',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      count: Math.floor(Math.random() * 50000) + 1000,
      active: Math.random() > 0.5,
      activeColor: 'text-[var(--error-color-6)]',
    },
    {
      key: 'comment',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      count: Math.floor(Math.random() * 5000) + 100,
      active: false,
      activeColor: 'text-[var(--brand-color-6)]',
    },
    {
      key: 'favorite',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
      count: Math.floor(Math.random() * 10000) + 500,
      active: Math.random() > 0.7,
      activeColor: 'text-yellow-500',
    },
    {
      key: 'share',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>',
      count: Math.floor(Math.random() * 2000) + 50,
      active: false,
      activeColor: 'text-[var(--success-color-6)]',
    },
  ],
})

// 生成模拟数据
const generateMockVideos = (count: number): VideoItem[] => {
  return Array.from({ length: count }, (_, index) => createMockVideo(index + 1))
}

const meta: Meta<typeof CwTikTokFeed> = {
  title: '1. Components/Media/CwTikTokFeed',
  component: CwTikTokFeed,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '类似抖音的短视频Feed组件，支持虚拟滚动、滚轮控制和预加载功能',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 默认示例
export const Default: Story = {
  args: {
    texts: defaultTexts,
    userAvatarFallbackSrc: chatDefaultAvatar,
    videos: generateMockVideos(20),
    height: '100vh',
    bufferSize: 3,
    preloadOffset: 3,
    enableWheelControl: true,
    wheelSensitivity: 1,
    autoPlay: true,
    loop: true,
    initialIndex: 0,
  },
  render: (args) => {
    const handleCurrentChange = (index: number, video: VideoItem) => {
      console.log('当前视频变化:', index, video)
    }

    const handleLoadMore = (currentIndex: number, currentVideos: VideoItem[]) => {
      console.log('需要加载更多:', currentIndex, currentVideos.length)
    }

    const handleVideoPlay = (index: number, video: VideoItem) => {
      console.log('视频播放:', index, video.video.title)
    }

    const handleSocialAction = (action: CwSocialActionEvent, video: VideoItem) => {
      console.log('社交动作:', action.key, video.video.title)
    }

    return (
      <div className="w-full h-screen bg-black">
        <CwTikTokFeed
          {...(args as CwTikTokFeedProps)}
          onCurrentChange={handleCurrentChange}
          onLoadMore={handleLoadMore}
          onVideoPlay={handleVideoPlay}
          onSocialAction={handleSocialAction}
        />
      </div>
    )
  },
}
