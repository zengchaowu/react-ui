import type { CwSlotStyles } from './types'

export const slotBase: CwSlotStyles = {
  root:
    'cw-slot inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-dashed border-[var(--border-color)] bg-transparent text-[var(--text-color-placeholder)]',
  label: '[font-size:var(--font-size-caption)] font-medium leading-none select-none',
  blockWrap: 'flex h-full w-full min-h-12 items-center justify-center',
}
