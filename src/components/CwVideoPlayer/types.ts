export interface CwVideoPlayerProps {
  /** 视频源地址 */
  src: string
  /** 视频封面图片 */
  poster?: string
  /** 是否显示控制栏 */
  controls?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否静音 */
  muted?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 预加载策略 */
  preload?: 'none' | 'metadata' | 'auto'
  /** 是否支持全屏 */
  fullscreen?: boolean
  /** 初始音量 (0-1) */
  volume?: number
  /** 是否显示加载状态和播放按钮覆盖层 */
  showOverlay?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /**
   * 为 true 时容器使用 w-full h-full min-h-0，不占 aspect-video（用于聊天气泡等已给足外框尺寸的场景）
   */
  fitToParent?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwVideoPlayerStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwVideoPlayerTexts>
}

import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwVideoPlayerStyles {
  container: string
  /** 嵌入固定宽高父级时：无 aspect-video，与 videoObjectFit 搭配 */
  containerFillParent: string
  containerFocused: string
  video: string
  /** fitToParent 时 video 铺满裁切（与聊天气泡封面一致） */
  videoObjectFit: string
  overlayLoading: string
  overlayPlayButton: string
  controls: string
  controlsVisible: string
  controlsHidden: string
  playButton: string
  progressBarContainer: string
  progressBarTrack: string
  progressFill: string
  progressThumb: string
  timeDisplay: string
  volumeButton: string
  volumeGroup: string
  volumeSlider: string
  volumeSliderFill: string
  fullscreenButton: string
  controlsRow: string
  controlsGroupLeft: string
  controlsGroupRight: string
  /** CwIcon 样式配置（加载图标） */
  loadingIconStyles?: CwIconEmbed
  /** CwIcon 样式配置（播放按钮图标） */
  playButtonIconStyles?: CwIconEmbed
  /** CwIcon 样式配置（控制栏播放图标） */
  playIconStyles?: CwIconEmbed
  /** CwIcon 样式配置（音量图标） */
  volumeIconStyles?: CwIconEmbed
  /** CwIcon 样式配置（全屏图标） */
  fullscreenIconStyles?: CwIconEmbed
}

export interface CwVideoPlayerTexts {
  player: string
  play: string
  pause: string
  mute: string
  unmute: string
  fullscreen: string
  exitFullscreen: string
  loading: string
  error: string
  retry: string
}

export interface CwVideoPlayerEmits {
  /** 视频元数据加载完成 */
  loadedmetadata: [metadata: {
    duration: number
    videoWidth: number
    videoHeight: number
  }]
  /** 播放时间更新 */
  timeupdate: [currentTime: number]
  /** 开始播放 */
  play: []
  /** 暂停播放 */
  pause: []
  /** 播放结束 */
  ended: []
  /** 音量变化 */
  volumechange: [volume: number]
}

export interface CwVideoPlayerExpose {
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

export interface CwVideoPlayerControlsProps {
  /** 控制栏是否可见 */
  visible: boolean
  /** 是否正在播放 */
  isPlaying: boolean
  /** 当前播放时间 */
  currentTime: number
  /** 视频总时长 */
  duration: number
  /** 当前音量 (0-1) */
  volume: number
  /** 播放进度百分比 (0-100) */
  progress: number
  /** 是否支持全屏 */
  fullscreen: boolean
  /** 是否处于全屏状态 */
  isFullscreen: boolean
}

export interface CwVideoPlayerControlsEmits {
  /** 切换播放/暂停 */
  'toggle-play': []
  /** 切换静音 */
  'toggle-mute': []
  /** 切换全屏 */
  'toggle-fullscreen': []
  /** 跳转到指定时间 */
  seek: [time: number]
  /** 音量变化 */
  'volume-change': [volume: number]
}
