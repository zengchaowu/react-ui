import type { HTMLAttributes } from 'react'

import type { CwVideoPlayerTexts } from '@zengchaowu/ui-shared/components/CwVideoPlayer/types'

export interface CwVideoPlayerProps
  extends Omit<
      HTMLAttributes<HTMLDivElement>,
      | 'children'
      | 'className'
      | 'onPlay'
      | 'onPause'
      | 'onTimeUpdate'
      | 'onEnded'
      | 'onVolumeChange'
      | 'onLoadedMetadata'
      | 'onError'
    >,
    CwVideoPlayerEmits {
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
  /** 根容器额外 class */
  className?: string
  /**
   * 为 true 时容器使用 w-full h-full min-h-0，不占 aspect-video（用于聊天气泡等已给足外框尺寸的场景）
   */
  fitToParent?: boolean
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwVideoPlayerTexts>
}

export interface CwVideoPlayerEmits {
  /** 视频元数据加载完成 */
  onLoadedMetadata?: (metadata: {
    duration: number
    videoWidth: number
    videoHeight: number
  }) => void
  /** 播放时间更新 */
  onTimeUpdate?: (currentTime: number) => void
  /** 开始播放 */
  onPlay?: () => void
  /** 暂停播放 */
  onPause?: () => void
  /** 播放结束 */
  onEnded?: () => void
  /** 音量变化 */
  onVolumeChange?: (volume: number) => void
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
  getVideoElement: () => HTMLVideoElement | null
}

export interface CwVideoPlayerControlsEmits {
  /** 切换播放/暂停 */
  onTogglePlay?: () => void
  /** 切换静音 */
  onToggleMute?: () => void
  /** 切换全屏 */
  onToggleFullscreen?: () => void
  /** 跳转到指定时间 */
  onSeek?: (time: number) => void
  /** 音量变化 */
  onVolumeChange?: (volume: number) => void
}

export interface CwVideoPlayerControlsProps
  extends CwVideoPlayerControlsEmits {
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
