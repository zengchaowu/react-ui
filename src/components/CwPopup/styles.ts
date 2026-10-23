import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import type { CwPopupAppearance, CwPopupStyleSlots } from './types'

/**
 * 毛玻璃浮层视觉（圆角 / 描边 / 阴影 / 模糊）。
 * 与 vue-ui `CwContextMenu/styles.ts` 的 `CW_GLASS_FROSTED_MENU_CHROME_CLASS` 完全一致；
 * React 侧 CwContextMenu 尚未提供 styles，故此处内联同一份 class。
 */
const CW_GLASS_FROSTED_MENU_CHROME_CLASS = [
  'overflow-hidden outline-none',
  'rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)]',
  'backdrop-blur-xl',
].join(' ')

export const popupStyleSlotsBase: CwPopupStyleSlots = {
  // 壳不加 padding：避免原生/自定义滚动条被缩进；内容侧自行加等宽留白
  popup: ['cw-popup', CW_GLASS_FROSTED_MENU_CHROME_CLASS].join(' '),
  trigger: 'inline-block',
}

/** @ 提及面板浮层壳（与 `appearance="panel-mention"` 一致）；padding 在内层 listbox */
export const CW_POPUP_MENTION_PANEL_SHELL_CLASS = [
  CW_OVERLAY_MODAL_Z_CLASS,
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
  'max-h-48 min-w-[var(--size-mention-panel-min)] max-w-[min(22.5rem,calc(100vw-1.5rem))] overflow-y-auto',
].join(' ')

/** 表情选择器浮层壳（与 `appearance="panel-emoji"` 一致） */
export const CW_POPUP_EMOJI_PICKER_SHELL_CLASS = [
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
  'flex h-[23.75rem] w-[20rem] flex-col',
].join(' ')

export const CW_POPUP_EMOJI_PICKER_TRIGGER_CLASS = 'flex items-center'

export const cwPopupAppearancePopupClass: Record<CwPopupAppearance, string> = {
  default: popupStyleSlotsBase.popup,
  'panel-emoji': CW_POPUP_EMOJI_PICKER_SHELL_CLASS,
  'panel-mention': CW_POPUP_MENTION_PANEL_SHELL_CLASS,
}

export const cwPopupAppearanceTriggerClass: Record<CwPopupAppearance, string> = {
  default: popupStyleSlotsBase.trigger,
  'panel-emoji': CW_POPUP_EMOJI_PICKER_TRIGGER_CLASS,
  'panel-mention': '',
}

export function resolveCwPopupShellClass(
  appearance: CwPopupAppearance,
  popupClass?: string,
): string {
  const custom = popupClass?.trim()
  if (custom) return custom
  return cwPopupAppearancePopupClass[appearance]
}

export function resolveCwPopupTriggerClass(
  appearance: CwPopupAppearance,
  triggerClass?: string,
): string {
  if (triggerClass !== undefined) return triggerClass
  return cwPopupAppearanceTriggerClass[appearance]
}
