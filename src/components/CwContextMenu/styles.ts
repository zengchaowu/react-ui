import type { CwContextMenuAppearance, CwContextMenuStyles } from './types'
import { CW_OVERLAY_MODAL_Z_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'

/**
 * 毛玻璃浮层视觉（圆角 / 描边 / 阴影 / 模糊）。
 * 不含宽高与内边距，供 Select / DatePicker 等按场景自行加 padding。
 */
export const CW_GLASS_FROSTED_MENU_CHROME_CLASS = [
  'overflow-hidden outline-none',
  'rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)]',
  'backdrop-blur-xl',
].join(' ')

/**
 * 浮层壳公共布局：`w-max` 跟内容；勿加 `w-full`（相对视口定位会撑满整屏）。
 * Select 等另由内部 `width: triggerWidth` 定宽。
 * 壳本身不加 padding：滚动条贴边；等宽留白挂在滚动 content 上（见 {@link CW_GLASS_FROSTED_SHELL_PAD_CLASS}）。
 */
const CW_GLASS_FROSTED_SHELL_LAYOUT = 'pointer-events-auto w-max min-w-0'

/**
 * 上下/左右同为 0.25rem。
 * - 有 CwDiv 的列表：挂 `content-class`，避免把自定义滚动条一起缩进
 * - 无 CwDiv、项直接落在壳上（右键菜单）：挂面板 class
 */
/** flex+gap：项间距用 gap，避免选项 my 把上下贴边撑得比左右厚 */
export const CW_GLASS_FROSTED_SHELL_PAD_CLASS = 'flex flex-col gap-1 p-1'

/**
 * 右键菜单：项直接挂在壳上。壳本身**不加 flex/gap/padding**（跟 Select/Cascader 对齐）——
 * CwPopup 在 popup 根和 content 之间有一个 pluginContainer 空 div（用于箭头锚点等），
 * 如果 popup 根是 flex-col + gap-1，这个空 div 会作为 flex 子元素和 role=menu 之间被 gap 撑开，
 * 导致顶部额外多出 4px 不对称间距。padding / gap 改挂到 role=menu 那层。
 */
export const CW_GLASS_FROSTED_MENU_PANEL_CLASS = [
  'cw-context-menu-panel',
  CW_GLASS_FROSTED_SHELL_LAYOUT,
  'min-w-[var(--size-context-menu-min)] max-w-[18rem]',
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
].join(' ')

/** Select / Cascader / AutoComplete / Dropdown：壳无 padding，留白在 CwDiv content */
export const CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS = [
  CW_GLASS_FROSTED_SHELL_LAYOUT,
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
].join(' ')

/**
 * hover / 选中 / 按下同一品牌 tint 阶梯（只调透明度，不改字色）。
 * hover/键盘 6% → 选中/按下 12% → 选中再 hover（或键盘落在已选项）16%
 *
 * 注意：未选中 hover 与选中 hover 不能同时挂在同一节点上（Tailwind 会抢样式）。
 * 基类只保留 :active；hover 由调用方在「未选中」时挂 {@link CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS}。
 */
const CW_GLASS_FROSTED_ITEM_TINT_HOVER =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]'

/** 鼠标 hover（仅未选中项）：伪类 6% */
export const CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS =
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'

/**
 * 键盘游走高亮：与 hover 同档 6% 实底。
 * 勿用选中 12%，否则与「实际选中项」无法区分。
 */
export const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_HOVER

/** 键盘落在已选中项上：用选中+hover 档 16%，仍可看出焦点在该项 */
export const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS

/** 选中 12%；再 hover → 16%（勿与未选中 hover:6% 同节点共存） */
export const CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS = [
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED,
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]',
].join(' ')

/** 按下态（选中档 12%）；hover 不放基类 */
const CW_GLASS_FROSTED_ITEM_PRESS_CLASS = `active:${CW_GLASS_FROSTED_ITEM_TINT_SELECTED}`

/**
 * 行盒：统一内边距 / 字号 / 最小行高；项间距由父级 `gap-1` 承担（勿再 my，否则上下贴边比左右厚）。
 * 左右边距由壳 / CwDiv content 的 `p-1` 承担，行本身 `w-full`（勿再 mx）。
 * scroll-my：键盘 scrollIntoView 时保留与 content padding 一致的上下边距。
 */
const CW_GLASS_FROSTED_ITEM_BODY_CLASS = [
  'scroll-my-1 box-border min-h-8 min-w-0 w-full rounded-md',
  'px-2.5 py-1.5 text-[0.8125rem] leading-snug',
  'text-[var(--text-color-primary)]',
].join(' ')

/**
 * 列表选项槽（Select / Cascader / AutoComplete）。
 * 不含 hover；未选中时由组件挂 {@link CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS}。
 */
export const CW_GLASS_FROSTED_LIST_OPTION_CLASS = [
  'flex items-center overflow-hidden',
  CW_GLASS_FROSTED_ITEM_BODY_CLASS,
  CW_GLASS_FROSTED_ITEM_PRESS_CLASS,
].join(' ')

export const CW_GLASS_FROSTED_MENU_DIVIDER_CLASS =
  // 竖向间距由父级 gap-1 承担，勿再 my
  'mx-2.5 h-0 w-[calc(100%-1.25rem)] shrink-0 hairline-border-t border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]'

/** 右键 / Dropdown 菜单项基类：不含 hover，未选中时另挂 HOVER */
export const CW_GLASS_FROSTED_MENU_ITEM_CLASS = [
  'flex items-center gap-2 whitespace-nowrap text-left',
  CW_GLASS_FROSTED_ITEM_BODY_CLASS,
  CW_GLASS_FROSTED_ITEM_PRESS_CLASS,
  'data-[cw-context-submenu-open]:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]',
].join(' ')

export const defaultCwContextMenuStyles: CwContextMenuStyles = {
  root: 'cw-context-menu flex w-full min-w-0 flex-col mb-1 last:mb-0',
  panel: [
    'cw-context-menu-panel pointer-events-auto min-w-[var(--size-context-menu-min)] w-max max-w-[20rem] overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] shadow-sm outline-none',
  ].join(' '),
  item: 'flex w-full items-center gap-2 px-2.5 py-1.5 text-left [font-size:var(--font-size-caption)] leading-snug text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycontainer)] data-[cw-context-submenu-open]:bg-[var(--bg-color-component-hover)]',
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  itemHover: '',
  itemSelected: [
    'text-[var(--brand-color-6)]',
    CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  ].join(' '),
  divider: 'mx-0 my-1 h-0 w-full shrink-0 hairline-border-t border-[var(--border-color)]',
}

/** 移动端消息长按：横向工具条 */
export const toolbarCwContextMenuStyles: CwContextMenuStyles = {
  root: 'cw-context-menu-toolbar',
  panel: [
    CW_OVERLAY_MODAL_Z_CLASS,
    'pointer-events-auto',
    // 工具条横向：等宽 p-1；勿用 flex-col gap（那是竖向列表）
    'w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-xl border border-[var(--border-color)] bg-[var(--bg-color-container)] p-1 shadow-sm outline-none',
  ].join(' '),
  item:
    'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg px-0 py-1 text-center text-xs text-[var(--text-color-primary)] hover:bg-[var(--bg-color-component-hover)] active:bg-[var(--bg-color-secondarycontainer)]',
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  itemHover: '',
  itemSelected: [
    'text-[var(--brand-color-6)]',
    CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  ].join(' '),
  divider: 'hidden',
}

export const launcherCwContextMenuStyles: CwContextMenuStyles = {
  ...defaultCwContextMenuStyles,
  root: 'cw-context-menu flex w-max min-w-0 flex-col mb-1 last:mb-0',
  panel: CW_GLASS_FROSTED_MENU_PANEL_CLASS,
  item: CW_GLASS_FROSTED_MENU_ITEM_CLASS,
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  itemHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  itemSelected: CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  divider: CW_GLASS_FROSTED_MENU_DIVIDER_CLASS,
}

/**
 * Cursor 式纯文本菜单：圆角面板、项内圆角悬停、标签左 / 快捷键右、细分割线。
 * 业务侧通常不传 `icon`。
 */
export const plainCwContextMenuStyles: CwContextMenuStyles = {
  ...defaultCwContextMenuStyles,
  root: 'cw-context-menu flex w-max min-w-0 flex-col mb-1 last:mb-0',
  panel: [
    CW_OVERLAY_MODAL_Z_CLASS,
    'cw-context-menu-panel pointer-events-auto w-max min-w-[11rem] max-w-[20rem] overflow-hidden',
    'rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)]',
    'shadow-[0_4px_16px_color-mix(in_srgb,var(--scrim-base)_12%,transparent)] outline-none',
  ].join(' '),
  item: [
    'flex w-full box-border items-center gap-6 whitespace-nowrap',
    'rounded-md px-2.5 py-1.5 text-left text-[0.8125rem] leading-snug',
    'text-[var(--text-color-primary)]',
    'active:bg-[var(--bg-color-secondarycontainer)]',
    'data-[cw-context-submenu-open]:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]',
  ].join(' '),
  itemDanger: 'text-[var(--error-color-6)]',
  itemDisabled: 'opacity-40 cursor-not-allowed pointer-events-none',
  itemHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  itemSelected: [
    'text-[var(--text-color-primary)]',
    CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  ].join(' '),
  divider:
    'mx-2.5 h-0 w-[calc(100%-1.25rem)] shrink-0 hairline-border-t border-[var(--border-color)]',
}

export const toolRailCwContextMenuStyles: CwContextMenuStyles = {
  ...defaultCwContextMenuStyles,
  panel: [
    'cw-context-menu-panel pointer-events-auto min-w-[var(--size-context-menu-min)] w-max max-w-[18rem] overflow-visible rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] shadow-sm outline-none',
  ].join(' '),
  item:
    'relative flex w-full items-center gap-1.5 px-2 py-1 text-left text-[0.8125rem] leading-snug text-[var(--text-color-primary)] active:bg-[var(--bg-color-secondarycontainer)] data-[cw-context-submenu-open]:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]',
  itemHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  itemSelected: [
    'text-[var(--text-color-primary)]',
    CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  ].join(' '),
  divider: 'my-0 h-0 w-full shrink-0 hairline-border-t border-[var(--border-color)]',
}

export const appearanceStyles: Record<CwContextMenuAppearance, CwContextMenuStyles> = {
  default: defaultCwContextMenuStyles,
  compact: launcherCwContextMenuStyles,
  toolbar: toolbarCwContextMenuStyles,
  'glass-frosted': launcherCwContextMenuStyles,
  plain: plainCwContextMenuStyles,
  checklist: toolRailCwContextMenuStyles,
}

export function resolveCwContextMenuStyles(
  appearance: CwContextMenuAppearance = 'glass-frosted',
): CwContextMenuStyles {
  return appearanceStyles[appearance] ?? launcherCwContextMenuStyles
}
