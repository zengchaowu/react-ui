import type { CwMusicPlayerStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const musicPlayerBase: CwMusicPlayerStyles = {
  container:
    'cw-music-player relative flex w-full max-w-[24rem] flex-col gap-4 rounded-xl bg-[var(--bg-color-container)] p-4 outline-none focus:outline-none',
  containerFocused: INTERACTIVE_FOCUS_CLASS,
  coverWrap: 'relative mx-auto aspect-square w-full max-w-[16rem] overflow-hidden rounded-lg bg-[var(--bg-color-page)]',
  cover: 'h-full w-full object-cover',
  coverPlaceholder:
    'flex h-full w-full items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-page)_80%,var(--brand-color-6)_20%)]',
  meta: 'flex min-w-0 flex-col items-center gap-1 text-center',
  title: 'w-full truncate font-medium text-[var(--text-color-primary)] [font-size:var(--font-size-body-xl)]',
  artist: 'w-full truncate text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)]',
  lyricsWrap:
    'max-h-[8rem] overflow-y-auto rounded-lg bg-[var(--bg-color-page)] px-3 py-2 text-center',
  lyrics: 'whitespace-pre-wrap text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)] leading-relaxed',
  overlayLoading:
    'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,black_40%,transparent)]',
  overlayPlayButton:
    'absolute inset-0 flex items-center justify-center cursor-pointer bg-[color-mix(in_srgb,black_28%,transparent)]',
  playButtonLarge:
    'flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-color-6)] text-[var(--text-color-anti)] shadow-md',
  controls: 'flex flex-col gap-3',
  progressBarContainer: 'flex w-full items-center gap-2',
  progressBarTrack:
    'relative h-1.5 min-w-0 flex-1 cursor-pointer select-none touch-none rounded-full bg-[color-mix(in_srgb,var(--bg-color-component)_70%,transparent)]',
  progressFill: 'relative h-full rounded-full bg-[var(--brand-color-6)]',
  progressThumb:
    'absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--brand-color-6)] shadow-sm',
  timeDisplay:
    'w-10 shrink-0 font-mono tabular-nums text-[var(--text-color-secondary)] [font-size:var(--font-size-body-small)]',
  transportRow: 'flex items-center justify-center gap-2',
  transportButton:
    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[var(--text-color-primary)] transition-opacity active:opacity-70',
  transportButtonActive: 'text-[var(--brand-color-6)]',
  transportButtonDisabled: 'cursor-not-allowed opacity-40',
  transportPlayButton:
    'flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[var(--brand-color-6)] text-[var(--text-color-anti)] transition-opacity active:opacity-85',
  volumeRow: 'flex items-center justify-center gap-2',
  volumeButton: 'flex cursor-pointer items-center justify-center text-[var(--text-color-primary)]',
  volumeGroup: 'flex items-center gap-2',
  volumeSlider:
    'relative h-1.5 min-w-[5rem] w-28 max-w-[8rem] flex-1 cursor-pointer select-none touch-none rounded-full bg-[var(--bg-color-component)]',
  volumeSliderFill: 'h-full rounded-full bg-[var(--brand-color-6)]',
  playButton: 'flex cursor-pointer items-center justify-center',
  loadingIconStyles: {
    class: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 2,
  },
  playButtonIconStyles: {
    class: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 2.5,
  },
  playIconStyles: {
    class: 'inline-flex items-center justify-center text-[var(--text-color-anti)]',
    size: 1.75,
  },
  transportIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1.25,
  },
  transportPlayIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1.75,
  },
  volumeIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1.25,
  },
}
