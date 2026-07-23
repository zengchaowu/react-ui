import type { CwVideoPlayerStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwVideoPlayerStyles = {
  container: 'cw-video-player relative bg-[var(--bg-color-page)] rounded-lg overflow-hidden shadow-lg w-full aspect-video outline-none focus:outline-none',
  containerFillParent:
    'cw-video-player relative bg-[var(--bg-color-page)] rounded-lg overflow-hidden shadow-lg h-full min-h-0 w-full outline-none focus:outline-none',
  containerFocused: INTERACTIVE_FOCUS_CLASS,
  video: 'w-full h-full',
  videoObjectFit: 'w-full h-full object-cover',
  overlayLoading:
    'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-page)_50%,transparent)]',
  overlayPlayButton: 'absolute inset-0 flex items-center justify-center cursor-pointer',
  controls: 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-color-page)] to-transparent p-4 transition-opacity duration-300',
  controlsVisible: 'opacity-100',
  controlsHidden: 'opacity-0',
  playButton: 'flex items-center justify-center cursor-pointer',
  progressBarContainer: 'mb-3',
  progressBarTrack:
    'w-full h-1 cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--bg-color-container)_30%,transparent)]',
  progressFill: 'h-full bg-[var(--brand-color-6)] rounded-full transition-all',
  progressThumb: 'absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[var(--brand-color-6)] rounded-full opacity-0 hover:opacity-100 transition-opacity',
  timeDisplay: 'text-[var(--text-color-anti)] text-sm font-mono',
  volumeButton: 'text-[var(--text-color-anti)] flex items-center justify-center cursor-pointer',
  volumeGroup: 'flex items-center space-x-2',
  volumeSlider: 'w-16 h-1 bg-[var(--bg-color-component)] rounded-full cursor-pointer',
  volumeSliderFill: 'h-full bg-[var(--bg-color-container)] rounded-full',
  fullscreenButton: 'text-[var(--text-color-anti)] flex items-center justify-center cursor-pointer',
  controlsRow: 'flex items-center justify-between',
  controlsGroupLeft: 'flex items-center space-x-3',
  controlsGroupRight: 'flex items-center space-x-3',
  loadingIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 2,
  },
  playButtonIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)] drop-shadow-lg',
    size: 5,
  },
  playIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)] cursor-pointer',
    size: 1.5,
  },
  volumeIconStyles: {
    root: 'w-5 h-5',
    size: 1.25,
  },
  fullscreenIconStyles: {
    root: 'w-5 h-5',
    size: 1.25,
  },
}
