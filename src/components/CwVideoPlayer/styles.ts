import type { CwVideoPlayerStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** 透明浮层控件：overlay 按钮前景 token（随主题切换，非写死 anti 白） */
const onMediaFg = 'text-[var(--button-overlay-fg)]'
const onMediaTrack = 'bg-[color-mix(in_srgb,var(--button-overlay-fg)_35%,transparent)]'

export const videoPlayerBase: CwVideoPlayerStyles = {
  container:
    'cw-video-player relative bg-transparent rounded-lg overflow-hidden w-full aspect-video outline-none focus:outline-none',
  containerFillParent:
    'cw-video-player relative bg-transparent rounded-lg overflow-hidden h-full min-h-0 w-full outline-none focus:outline-none',
  containerFocused: INTERACTIVE_FOCUS_CLASS,
  video: 'w-full h-full object-cover',
  videoObjectFit: 'w-full h-full object-cover',
  overlayLoading: 'absolute inset-0 flex items-center justify-center',
  overlayPlayButton: 'absolute inset-0 flex items-center justify-center cursor-pointer',
  controls: 'absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300',
  controlsVisible: 'opacity-100',
  controlsHidden: 'opacity-0',
  playButton: 'flex items-center justify-center cursor-pointer',
  progressBarContainer: 'mb-3',
  progressBarTrack: `w-full h-1 cursor-pointer rounded-full ${onMediaTrack}`,
  progressFill: 'h-full bg-[var(--brand-color-6)] rounded-full transition-all',
  progressThumb: 'absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[var(--brand-color-6)] rounded-full opacity-0 hover:opacity-100 transition-opacity',
  timeDisplay: `${onMediaFg} text-sm font-mono`,
  volumeButton: `${onMediaFg} flex items-center justify-center cursor-pointer`,
  volumeGroup: 'flex items-center space-x-2',
  volumeSlider: `w-16 h-1 rounded-full cursor-pointer ${onMediaTrack}`,
  volumeSliderFill: 'h-full rounded-full bg-[var(--button-overlay-fg)]',
  fullscreenButton: `${onMediaFg} flex items-center justify-center cursor-pointer`,
  controlsRow: 'flex items-center justify-between',
  controlsGroupLeft: 'flex items-center space-x-3',
  controlsGroupRight: 'flex items-center space-x-3',
  loadingIconStyles: {
    class: `inline-flex items-center justify-center ${onMediaFg}`,
    size: 2,
  },
  playButtonIconStyles: {
    class: `inline-flex items-center justify-center ${onMediaFg}`,
    size: 5,
  },
  playIconStyles: {
    class: `inline-flex items-center justify-center ${onMediaFg} cursor-pointer`,
    size: 1.5,
  },
  volumeIconStyles: {
    class: `inline-flex items-center justify-center ${onMediaFg}`,
    size: 1.25,
  },
  fullscreenIconStyles: {
    class: `inline-flex items-center justify-center ${onMediaFg}`,
    size: 1.25,
  },
}
