import type { CwContextMenuAppearance, CwContextMenuStyles } from './types'
import { CW_OVERLAY_MODAL_Z_CLASS } from '../../constants/cwOverlayStack'

export const defaultCwContextMenuStyles: CwContextMenuStyles = {
  root: 'cw-context-menu flex w-full min-w-0 flex-col mb-1 last:mb-0',
  panel: [
    'pointer-events-auto',
    'min-w-[10rem] max-w-[20rem] overflow-hidden rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-container)] shadow-lg outline-none',
  ].join(' '),
  item: 'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycontainer)]',
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  divider:
    'mx-0 my-1 box-border h-px w-full shrink-0 border-0 bg-[var(--border-color-lighter)] [color:transparent] scale-y-[0.5] origin-top',
}

/** Attach / 会话列表右键：仅菜单项 padding，避免 panel + item 双层留白 */
export const attachCwContextMenuStyles: CwContextMenuStyles = {
  ...defaultCwContextMenuStyles,
  panel: [
    CW_OVERLAY_MODAL_Z_CLASS,
    'pointer-events-auto',
    'min-w-[9.25rem] max-w-[20rem] overflow-hidden rounded-md border border-[var(--component-border)] bg-[var(--bg-color-container)] shadow-lg outline-none',
  ].join(' '),
  item:
    'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycontainer)]',
  divider:
    'my-0 box-border h-px w-full shrink-0 border-0 bg-[var(--border-color-lighter)] [color:transparent] scale-y-[0.5] origin-top',
}

/** 移动端消息长按：横向工具条 */
export const toolbarCwContextMenuStyles: CwContextMenuStyles = {
  root: 'cw-context-menu-toolbar',
  panel: [
    CW_OVERLAY_MODAL_Z_CLASS,
    'pointer-events-auto',
    'w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-xl border border-[var(--component-border)] bg-[var(--bg-color-container)] px-0.5 py-1 shadow-lg outline-none',
  ].join(' '),
  item:
    'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-0 py-1 text-center text-xs text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycontainer)]',
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  divider: 'hidden',
}

/** 桌面启动器毛玻璃菜单 */
export const launcherCwContextMenuStyles: CwContextMenuStyles = {
  ...defaultCwContextMenuStyles,
  panel: [
    'pointer-events-auto min-w-[11.5rem] max-w-[18rem] overflow-hidden outline-none',
    'rounded-xl border border-[color-mix(in_srgb,var(--component-border)_55%,transparent)]',
    'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
    'shadow-[0_8px_28px_color-mix(in_srgb,var(--scrim-base)_18%,transparent)]',
    'backdrop-blur-xl py-1.5',
  ].join(' '),
  item: [
    'flex items-center gap-2.5 mx-1.5 w-[calc(100%-0.75rem)] box-border px-2.5 py-2 text-left text-[0.8125rem]',
    'rounded-md text-[var(--text-color-primary)]',
    'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
    'active:bg-[color-mix(in_srgb,var(--brand-color-6)_18%,transparent)]',
  ].join(' '),
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  divider:
    'mx-2 my-1.5 box-border h-px w-[calc(100%-1rem)] shrink-0 border-0 bg-[color-mix(in_srgb,var(--component-border)_70%,transparent)]',
}

export const appearanceStyles: Record<CwContextMenuAppearance, CwContextMenuStyles> = {
  default: defaultCwContextMenuStyles,
  attach: attachCwContextMenuStyles,
  toolbar: toolbarCwContextMenuStyles,
  launcher: launcherCwContextMenuStyles,
}

export function resolveCwContextMenuStyles(
  appearance: CwContextMenuAppearance = 'default',
): CwContextMenuStyles {
  return appearanceStyles[appearance] ?? defaultCwContextMenuStyles
}
