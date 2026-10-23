import type { CwLoginPanelStyles } from './types'

export const cwLoginPanelBase: CwLoginPanelStyles = {
  root: 'bg-[var(--bg-color-container)] flex items-start justify-center pt-12 pb-4',
  card:
    'w-full max-w-md relative border border-[var(--border-color)] rounded-lg p-4',
  switchSlot: 'absolute top-0 right-0',
  qrcodeBox:
    'relative w-[13.75rem] h-[13.75rem] bg-white border border-[var(--border-color)] rounded-lg flex items-center justify-center overflow-hidden',
  qrcodeImage: 'w-full h-full border-0 bg-white [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0',
  wechatFooter:
    'mt-6 p-4 bg-[var(--bg-color-secondarycontainer)] rounded-lg flex items-center justify-between gap-4',
}
