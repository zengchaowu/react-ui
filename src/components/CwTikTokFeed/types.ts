// CwTikTokFeed 主组件类型定义
export interface VideoInfo {
  /** 视频ID */
  id: string
  /** 视频标题 */
  title?: string
  /** 视频描述 */
  description?: string
  /** 视频标签 */
  tags?: string[]
  /** 视频时长（秒） */
  duration?: number
  /** 视频创建时间 */
  createdAt?: string
  /** 视频封面图 */
  poster?: string
}

export interface UserInfo {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 用户昵称 */
  nickname?: string
  /** 用户头像 */
  avatar?: string
  /** 是否已关注 */
  isFollowed?: boolean
  /** 是否认证用户 */
  isVerified?: boolean
}

export interface SocialAction {
  /** 动作唯一标识 */
  key: string
  /** 显示的图标 SVG 内容 */
  icon: string
  /** 显示的数量 */
  count?: number
  /** 显示的文本 */
  text?: string
  /** 是否激活状态 */
  active?: boolean
  /** 激活状态下的图标颜色类名 */
  activeColor?: string
  /** 是否可点击 */
  clickable?: boolean
}

export interface VideoItem {
  /** 视频项唯一标识 */
  id?: string
  /** 视频信息 */
  video: VideoInfo
  /** 用户信息 */
  user: UserInfo
  /** 社交动作配置列表 */
  socialActions?: SocialAction[]
}

export interface CwTikTokFeedProps {
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
   * 自定义样式对象
   */
  styles?: Partial<CwTikTokFeedStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwTikTokFeedTexts>
}

export interface CwTikTokFeedStyles {
  root: string
  container: string
  item: string
  player: string
  overlay: string
  controls: string
  leftControls: string
  rightControls: string
  avatar: string
  username: string
  description: string
  actionButton: string
  actionIcon: string
  actionText: string
  progressBar: string
  progressFill: string
  loading: string
  loadingSpinner: string
  loadingText: string
}

export interface CwTikTokFeedTexts {
  loading: string
  like: string
  comment: string
  share: string
  follow: string
  unfollow: string
  play: string
  pause: string
  mute: string
  unmute: string
  fullscreen: string
  exitFullscreen: string
}

export interface CwTikTokFeedEmits {
  /** 当前视频变化事件 */
  'current-change': [index: number, video: VideoItem]
  /** 需要加载更多视频事件 */
  'load-more': [currentIndex: number, currentVideos: VideoItem[]]
  /** 视频播放事件 */
  'video-play': [index: number, video: VideoItem]
  /** 视频暂停事件 */
  'video-pause': [index: number, video: VideoItem]
  /** 视频结束事件 */
  'video-ended': [index: number, video: VideoItem]
  /** 用户点击事件 */
  'user-click': [user: UserInfo, video: VideoItem]
  /** 关注点击事件 */
  'follow-click': [user: UserInfo, video: VideoItem]
  /** 社交动作点击事件 */
  'social-action': [action: { key: string; action: SocialAction; newState?: any }, video: VideoItem]
  /** 视频信息点击事件 */
  'video-info-click': [videoInfo: VideoInfo, video: VideoItem]
}

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

// CwTikTokPlayer 子组件类型定义
export interface CwTikTokPlayerProps {
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
  videoConfig?: Record<string, any>
  /** 头像组件配置 */
  avatarConfig?: Record<string, any>
}

export interface CwTikTokPlayerEmits {
  /** 视频播放事件 */
  play: []
  /** 视频暂停事件 */
  pause: []
  /** 视频结束事件 */
  ended: []
  /** 用户头像点击事件 */
  'user-click': [user: UserInfo]
  /** 关注按钮点击事件 */
  'follow-click': [user: UserInfo]
  /** 社交动作点击事件 */
  'social-action': [data: { key: string; action: SocialAction; newState?: any }]
  /** 视频信息点击事件 */
  'video-info-click': [video: VideoInfo]
}

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

// 虚拟滚动相关类型
export interface VirtualItem {
  /** 索引 */
  index: number
  /** 数据 */
  data: VideoItem
  /** 高度 */
  height: number
  /** 顶部位置 */
  top: number
}

export interface ScrollState {
  /** 滚动位置 */
  scrollTop: number
  /** 是否正在滚动 */
  isScrolling: boolean
}

export interface PreloadState {
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 已加载数量 */
  loadedCount: number
}

// CwSocialSidebar 子组件类型定义
export interface CwSocialSidebarProps {
  /** 社交动作配置列表 */
  actions?: SocialAction[]
}

export interface CwSocialSidebarEmits {
  /** 动作点击事件 */
  action: [data: { key: string; action: SocialAction; newState?: any }]
}