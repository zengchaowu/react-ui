import type { HTMLAttributes } from 'react'

import type { CwMusicPlayerTexts } from '@zengchaowu/ui-shared/components/CwMusicPlayer/types'

export interface CwMusicPlayerProps
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
    CwMusicPlayerEmits {
  /** 音频源地址 */
  src: string
  /** 歌曲标题 */
  title?: string
  /** 艺术家 */
  artist?: string
  /** 封面图片 */
  cover?: string
  /** 歌词文本（纯文本，按行展示） */
  lyrics?: string
  /** 是否显示控制栏 */
  controls?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否循环播放当前曲目 */
  loop?: boolean
  /** 随机播放按钮高亮（状态由父组件控制） */
  shuffleActive?: boolean
  /** 预加载策略 */
  preload?: 'none' | 'metadata' | 'auto'
  /** 初始音量 (0-1) */
  volume?: number
  /** 是否显示封面 */
  showCover?: boolean
  /** 是否显示歌词区域 */
  showLyrics?: boolean
  /** 是否显示上一首 / 下一首 / 随机 / 列表按钮 */
  showTransport?: boolean
  /** 是否显示音量控制 */
  showVolume?: boolean
  /** 上一首是否可用 */
  hasPrev?: boolean
  /** 下一首是否可用 */
  hasNext?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 根容器额外 class */
  className?: string
  /** 自定义文本 */
  texts?: Partial<CwMusicPlayerTexts>
}

export interface CwMusicPlayerEmits {
  onLoadedMetadata?: (metadata: { duration: number }) => void
  onTimeUpdate?: (currentTime: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onVolumeChange?: (volume: number) => void
  onPrev?: () => void
  onNext?: () => void
  onShuffle?: () => void
  onPlaylist?: () => void
  onError?: (message: string) => void
}

export interface CwMusicPlayerExpose {
  play: () => Promise<void> | undefined
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getAudioElement: () => HTMLAudioElement | null
}

export interface CwMusicPlayerControlsEmits {
  onTogglePlay?: () => void
  onToggleMute?: () => void
  onToggleLoop?: () => void
  onSeek?: (time: number) => void
  onVolumeChange?: (volume: number) => void
  onPrev?: () => void
  onNext?: () => void
  onShuffle?: () => void
  onPlaylist?: () => void
}

export interface CwMusicPlayerControlsProps
  extends CwMusicPlayerControlsEmits {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
  loop: boolean
  shuffleActive: boolean
  showTransport: boolean
  showVolume: boolean
  hasPrev: boolean
  hasNext: boolean
  disabled: boolean
  texts?: Partial<CwMusicPlayerTexts>
}
