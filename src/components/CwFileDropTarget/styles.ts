import type { CwFileDropTargetStyles } from './types'

export const defaultCwFileDropTargetStyles: CwFileDropTargetStyles = {
  root:
    'relative flex min-h-0 min-w-0 h-full w-full flex-1 flex-col',
  content: 'relative flex min-h-0 min-w-0 flex-1 flex-col',
  overlay:
    'pointer-events-none absolute inset-0 z-[var(--z-index-sticky)] flex items-center justify-center border-2 border-dashed border-transparent bg-transparent opacity-0 transition-opacity duration-150',
  overlayActive:
    'opacity-100 border-[var(--brand-color-6)] bg-[color-mix(in_srgb,var(--brand-color-6)_8%,transparent)]',
  overlayInner: 'flex flex-col items-center gap-2 px-4 text-center',
  overlayIcon: 'text-[var(--brand-color-6)]',
  overlayText: 'text-sm text-[var(--brand-color-6)]',
}
