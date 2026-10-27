import type { HTMLAttributes } from 'react'
import type { CwAvatarProps } from '../CwAvatar/types'
import type { CwVideoPlayerProps } from '../CwVideoPlayer/types'
import type { SocialAction, VideoItem, CwTikTokFeedTexts, UserInfo, VideoInfo } from '@zengchaowu/ui-shared/components/CwTikTokFeed/types'

// CwTikTokFeed 主组件类型定义

/** 社交动作点击时翻转出的新状态（如点赞/收藏 active 切换） */
export interface CwSocialActionState {
  active?: boolean
}

export interface CwSocialActionEvent {
  key: string
  action: SocialAction
  newState?: CwSocialActionState
}

export interface CwTikTokFeedProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>,
    CwTikTokFeedEmits {
  /** 必传：侧栏用户头像加载失败时的占位图 URL */
  userAvatarFallbackSrc: string
  /** 视频列表数据 */
  videos: VideoItem[]
  /** 容器高度 */
  height?: string
  /** 每个视频项的高度 */
  itemHeight?: number
  /** 可见区域缓冲数量 */
  bufferSize?: number
  /** 预加载触发位置（倒数第几个） */
  preloadOffset?: number
  /** 是否启用滚轮控制 */
  enableWheelControl?: boolean
  /** 滚轮灵敏度 */
  wheelSensitivity?: number
  /** 是否自动播放当前视频 */
  autoPlay?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 初始显示的视频索引 */
  initialIndex?: number
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwTikTokFeedTexts>
  /** 根容器额外 class（对应 Vue attrs.class） */
  className?: string
}

export interface CwTikTokFeedEmits {
  /** 当前视频变化事件 */
  onCurrentChange?: (index: number, video: VideoItem) => void
  /** 需要加载更多视频事件 */
  onLoadMore?: (currentIndex: number, currentVideos: VideoItem[]) => void
  /** 视频播放事件 */
  onVideoPlay?: (index: number, video: VideoItem) => void
  /** 视频暂停事件 */
  onVideoPause?: (index: number, video: VideoItem) => void
  /** 视频结束事件 */
  onVideoEnded?: (index: number, video: VideoItem) => void
  /** 用户点击事件 */
  onUserClick?: (user: UserInfo, video: VideoItem) => void
  /** 关注点击事件 */
  onFollowClick?: (user: UserInfo, video: VideoItem) => void
  /** 社交动作点击事件 */
  onSocialAction?: (action: CwSocialActionEvent, video: VideoItem) => void
  /** 视频信息点击事件 */
  onVideoInfoClick?: (videoInfo: VideoInfo, video: VideoItem) => void
}

/** defineExpose 对应的 imperative handle */
export interface CwTikTokFeedHandle {
  /** 跳转到指定视频 */
  scrollToVideo: (index: number) => void
  /** 获取当前视频索引 */
  getCurrentIndex: () => number
  /** 播放当前视频 */
  playCurrentVideo: () => void
  /** 暂停当前视频 */
  pauseCurrentVideo: () => void
  /** 播放下一个视频 */
  nextVideo: () => void
  /** 播放上一个视频 */
  prevVideo: () => void
  /** 获取当前视频 */
  getCurrentVideo: () => VideoItem | null
  /** 刷新虚拟滚动 */
  refreshVirtualScroll: () => void
}

// CwTikTokPlayer 子组件类型定义
export interface CwTikTokPlayerProps extends CwTikTokPlayerEmits {
  /** 必传：用户头像加载失败时的占位图 URL */
  userAvatarFallbackSrc: string
  /** 视频信息 */
  video: VideoInfo
  /** 用户信息 */
  user: UserInfo
  /** 社交动作配置 */
  socialActions?: SocialAction[]
  /** 是否显示用户信息 */
  showUserInfo?: boolean
  /** 是否显示视频信息 */
  showVideoInfo?: boolean
  /** 是否显示社交侧边栏 */
  showSocialSidebar?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否静音播放 */
  muted?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 视频播放器配置 */
  videoConfig?: Partial<CwVideoPlayerProps>
  /** 头像组件配置 */
  avatarConfig?: Partial<CwAvatarProps>
}

export interface CwTikTokPlayerEmits {
  /** 视频播放事件 */
  onPlay?: () => void
  /** 视频暂停事件 */
  onPause?: () => void
  /** 视频结束事件 */
  onEnded?: () => void
  /** 用户头像点击事件 */
  onUserClick?: (user: UserInfo) => void
  /** 关注按钮点击事件 */
  onFollowClick?: (user: UserInfo) => void
  /** 社交动作点击事件 */
  onSocialAction?: (data: CwSocialActionEvent) => void
  /** 视频信息点击事件 */
  onVideoInfoClick?: (video: VideoInfo) => void
}

/** defineExpose 对应的 imperative handle */
export interface CwTikTokPlayerHandle {
  /** 播放视频 */
  play: () => Promise<void> | undefined
  /** 暂停视频 */
  pause: () => void
  /** 跳转到指定时间 */
  seek: (time: number) => void
  /** 设置音量 */
  setVolume: (volume: number) => void
  /** 获取当前播放时间 */
  getCurrentTime: () => number
  /** 获取视频总时长 */
  getDuration: () => number
  /** 获取视频DOM元素 */
  getVideoElement: () => HTMLVideoElement | null
}

// 虚拟滚动相关类型

// CwSocialSidebar 子组件类型定义
export interface CwSocialSidebarProps {
  /** 社交动作配置列表 */
  actions?: SocialAction[]
  /** 动作点击事件 */
  onAction?: (data: CwSocialActionEvent) => void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSocialSidebarEmits {
  /** 动作点击事件 */
  action: [data: { key: string; action: SocialAction; newState?: any }]
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwTikTokFeedExpose {
  /** 跳转到指定视频 */
  scrollToVideo: (index: number) => void
  /** 获取当前视频索引 */
  getCurrentIndex: () => number
  /** 播放当前视频 */
  playCurrentVideo: () => void
  /** 暂停当前视频 */
  pauseCurrentVideo: () => void
  /** 播放下一个视频 */
  nextVideo: () => void
  /** 播放上一个视频 */
  prevVideo: () => void
  /** 获取当前视频 */
  getCurrentVideo: () => VideoItem | null
  /** 刷新虚拟滚动 */
  refreshVirtualScroll: () => void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwTikTokPlayerExpose {
  /** 播放视频 */
  play: () => Promise<void> | undefined
  /** 暂停视频 */
  pause: () => void
  /** 跳转到指定时间 */
  seek: (time: number) => void
  /** 设置音量 */
  setVolume: (volume: number) => void
  /** 获取当前播放时间 */
  getCurrentTime: () => number
  /** 获取视频总时长 */
  getDuration: () => number
  /** 获取视频DOM元素 */
  getVideoElement: () => HTMLVideoElement | undefined
}
