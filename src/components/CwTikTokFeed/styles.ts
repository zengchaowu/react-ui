import type { CwTikTokFeedStyles } from './types'

export const defaultStyles: CwTikTokFeedStyles = {
  root: 'cw-tik-tok-feed relative overflow-hidden touch-pan-y',
  container: 'relative transition-transform duration-300 ease-out',
  item: 'absolute w-full',
  player: 'w-full h-full',
  overlay: 'absolute inset-0 bg-[var(--overlay-scrim-video)]',
  controls: 'absolute bottom-4 left-4 right-4 flex justify-between items-end',
  leftControls: 'flex flex-col gap-4',
  rightControls: 'flex flex-col gap-4',
  avatar: 'w-12 h-12 rounded-full border-2 border-[var(--text-color-anti)]',
  username: 'text-[var(--text-color-anti)] font-semibold text-sm',
  description: 'text-[var(--text-color-anti)] text-sm mt-2 max-w-xs',
  actionButton: 'flex flex-col items-center gap-1 text-[var(--text-color-anti)]',
  actionIcon: 'w-8 h-8',
  actionText: 'text-xs',
  progressBar: 'absolute bottom-0 left-0 right-0 h-1 bg-[color-mix(in_srgb,var(--text-color-anti)_30%,transparent)]',
  progressFill: 'h-full bg-[var(--bg-color-container)] transition-all duration-100',
  loading: 'absolute inset-0 flex items-center justify-center bg-[var(--overlay-scrim-half)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-color-anti)]',
  loadingText: 'text-[var(--text-color-anti)] text-sm mt-2',
}
