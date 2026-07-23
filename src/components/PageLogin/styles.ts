import type { PageLoginStyles } from './types'

export const defaultStyles: PageLoginStyles = {
  root: 'bg-[var(--bg-color-container)] flex items-start justify-center pt-12 pb-4',
  card:
    'w-full max-w-md relative border border-[var(--border-color-light)] rounded-lg p-4',
  switchSlot: 'absolute top-0 right-0',
  qrcodeBox:
    'w-48 h-48 bg-[var(--bg-color-container)] border border-[var(--border-color-light)] rounded-lg flex items-center justify-center',
  qrcodeImage: 'w-full h-full object-contain',
  wechatFooter:
    'mt-6 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg flex items-center justify-between gap-4',
}
