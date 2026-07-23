import type { CwMusicPlayerStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwMusicPlayerStyles = {
  container:
    'cw-music-player relative flex w-full max-w-[24rem] flex-col gap-4 rounded-xl bg-[var(--bg-color-container)] p-4 shadow-lg outline-none focus:outline-none',
  containerFocused: INTERACTIVE_FOCUS_CLASS,
  coverWrap: 'relative mx-auto aspect-square w-full max-w-[16rem] overflow-hidden rounded-lg bg-[var(--bg-color-page)]',
  cover: 'h-full w-full object-cover',
  coverPlaceholder:
    'flex h-full w-full items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-page)_80%,var(--brand-color-6)_20%)]',
  meta: 'flex min-w-0 flex-col items-center gap-1 text-center',
  title: 'w-full truncate font-medium text-[var(--text-color-primary)] [font-size:var(--font-size-title-small)]',
  artist: 'w-full truncate text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)]',
  lyricsWrap:
    'max-h-[8rem] overflow-y-auto rounded-lg bg-[var(--bg-color-page)] px-3 py-2 text-center',
  lyrics: 'whitespace-pre-wrap text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)] leading-relaxed',
  overlayLoading:
    'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-page)_50%,transparent)]',
  overlayPlayButton: 'absolute inset-0 flex items-center justify-center cursor-pointer',
  playButtonLarge: 'flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-color-page)_60%,transparent)]',
  controls: 'flex flex-col gap-3',
  progressBarContainer: '',
  progressBarTrack:
    'relative h-1 w-full cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--bg-color-component)_60%,transparent)]',
  progressFill: 'relative h-full rounded-full bg-[var(--brand-color-6)] transition-all',
  progressThumb:
    'absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--brand-color-6)] opacity-0 transition-opacity hover:opacity-100',
  timeDisplay: 'text-center font-mono text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)]',
  transportRow: 'flex items-center justify-center gap-3',
  transportButton:
    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[var(--text-color-primary)] transition-opacity active:opacity-70',
  transportButtonActive: 'text-[var(--brand-color-6)]',
  transportButtonDisabled: 'cursor-not-allowed opacity-40',
  transportPlayButton:
    'flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-color-6)] text-[var(--text-color-anti)] transition-opacity active:opacity-85',
  volumeRow: 'flex items-center justify-center gap-2',
  volumeButton: 'flex cursor-pointer items-center justify-center text-[var(--text-color-primary)]',
  volumeGroup: 'flex items-center gap-2',
  volumeSlider: 'h-1 w-20 cursor-pointer rounded-full bg-[var(--bg-color-component)]',
  volumeSliderFill: 'h-full rounded-full bg-[var(--brand-color-6)]',
  playButton: 'flex cursor-pointer items-center justify-center',
  loadingIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 2,
  },
  playButtonIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 2.5,
  },
  playIconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 1.75,
  },
  transportIconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1.25,
  },
  transportPlayIconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1.75,
  },
  volumeIconStyles: {
    root: 'inline-flex items-center justify-center',
    size: 1.25,
  },
}
