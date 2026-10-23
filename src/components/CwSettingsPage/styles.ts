import type { CwSettingsPageStyles } from './types'

export const settingsPageBase: CwSettingsPageStyles = {
  // contentInset 栈层透明，由本页铺底；左右与设置窗搜索区对齐（1.5rem）
  root: [
    'cw-settings-page box-border flex h-full min-h-0 w-full flex-col gap-0',
    'bg-[color-mix(in_srgb,var(--bg-color-page)_96%,white)]',
    'px-6',
  ].join(' '),
  header: 'mb-5 flex w-full shrink-0 items-center gap-2',
  title:
    'm-0 text-[1.75rem] font-semibold leading-tight text-[var(--text-color-primary)]',
  body: 'flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-auto',
}
