import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwMusicPlayerProps {
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
  /** 自定义样式 */
  styles?: Partial<CwMusicPlayerStyles>
  /** 自定义文本 */
  texts?: Partial<CwMusicPlayerTexts>
}

export interface CwMusicPlayerStyles {
  container: string
  containerFocused: string
  coverWrap: string
  cover: string
  coverPlaceholder: string
  meta: string
  title: string
  artist: string
  lyricsWrap: string
  lyrics: string
  overlayLoading: string
  overlayPlayButton: string
  playButtonLarge: string
  controls: string
  progressBarContainer: string
  progressBarTrack: string
  progressFill: string
  progressThumb: string
  timeDisplay: string
  transportRow: string
  transportButton: string
  transportButtonActive: string
  transportButtonDisabled: string
  transportPlayButton: string
  volumeRow: string
  volumeButton: string
  volumeGroup: string
  volumeSlider: string
  volumeSliderFill: string
  playButton: string
  loadingIconStyles?: CwIconEmbed
  playButtonIconStyles?: CwIconEmbed
  playIconStyles?: CwIconEmbed
  transportIconStyles?: CwIconEmbed
  transportPlayIconStyles?: CwIconEmbed
  volumeIconStyles?: CwIconEmbed
}

export interface CwMusicPlayerTexts {
  player: string
  play: string
  pause: string
  mute: string
  unmute: string
  prev: string
  next: string
  shuffle: string
  repeat: string
  playlist: string
  loading: string
  error: string
  unknownTitle: string
  unknownArtist: string
}

export interface CwMusicPlayerEmits {
  loadedmetadata: [metadata: { duration: number }]
  timeupdate: [currentTime: number]
  play: []
  pause: []
  ended: []
  volumechange: [volume: number]
  prev: []
  next: []
  shuffle: []
  playlist: []
  error: [message: string]
}

export interface CwMusicPlayerExpose {
  play: () => Promise<void> | undefined
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getAudioElement: () => HTMLAudioElement | undefined
}

export interface CwMusicPlayerControlsProps {
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
}

export interface CwMusicPlayerControlsEmits {
  'toggle-play': []
  'toggle-mute': []
  'toggle-loop': []
  seek: [time: number]
  'volume-change': [volume: number]
  prev: []
  next: []
  shuffle: []
  playlist: []
}
