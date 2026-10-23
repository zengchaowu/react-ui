import type { CwSettingsNavRowStyles } from './types'

export const settingsNavRowBase: CwSettingsNavRowStyles = {
  titleWrap: 'flex min-w-0 items-center gap-3',
  icon: [
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
    'bg-[color-mix(in_srgb,var(--brand-color-6)_10%,transparent)]',
    'text-[var(--brand-color-6)]',
  ].join(' '),
  iconDanger: [
    'bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)]',
    'text-[var(--error-color-6)]',
  ].join(' '),
  title: 'text-[0.875rem] font-semibold leading-snug text-[var(--text-color-primary)]',
  titleDanger: 'text-[var(--error-color-6)]',
}
