import type { CwChromeTabAppearance, CwChromeTabStyleSlots } from './types'

export const chromeTabBase: CwChromeTabStyleSlots = {
  root: 'cw-chrome-tab',
  bar:
    'relative flex items-end gap-0 bg-[var(--bg-color-secondarycontainer)]',
  addButton:
    'ml-1 flex h-[1.875rem] w-[1.875rem] shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:text-[var(--text-color-primary)]',
  addIcon: 'h-4 w-4',
  tab: 'group relative flex h-[1.875rem] cursor-pointer select-none items-center gap-1.5 border px-3 text-xs transition-colors hairline-border',
  tabGap: '-mr-px',
  tabActive:
    'z-[var(--z-index-sticky)] border-[var(--border-color)] border-b-transparent hairline-border-b-0 bg-[var(--bg-color-container)] text-[var(--text-color-primary)]',
  tabInactive:
    'border-[var(--border-color)] bg-[var(--bg-color-component)] text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]',
  tabDisabled: 'cursor-not-allowed opacity-40',
  tabLabel: 'max-w-[7.5rem] truncate',
  tabIcon: 'h-3.5 w-3.5 shrink-0',
  tabIconSlot: 'flex h-3.5 w-3.5 shrink-0 items-center justify-center',
  closeButton:
    // hover 只加深文字，不改背景
    'ml-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[var(--text-color-secondary)] transition-[opacity,color] hover:text-[var(--text-color-primary)] [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100',
  closeButtonFocus: 'opacity-100',
  closeIcon: 'h-2.5 w-2.5',
}

export const appearanceStyles: Record<
  CwChromeTabAppearance,
  Partial<CwChromeTabStyleSlots>
> = {
  default: {},
  /**
   * IDE 编辑区 / 对话标签条（对齐 CodeWorkspaceEditorTabs）：
   * - 条底用 inset 阴影画分割线（避免 overflow 裁切负 margin 盖线失败）
   * - 选中 tab 白底盖住该线，与下方编辑区连成一体
   * - tab 仅右边框，未选中无底色块
   */
  'tab-strip': {
    root: 'cw-chrome-tab min-w-0',
    bar: 'relative flex shrink-0 items-stretch gap-0 overflow-x-auto bg-[var(--bg-color-secondarycontainer)] shadow-[inset_0_-0.5px_0_0_var(--border-color)]',
    tab: 'group relative z-[var(--z-index-above)] flex max-w-[14rem] shrink-0 cursor-pointer select-none items-center gap-0.5 px-2 py-1.5 [font-size:var(--font-size-caption)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-color)] hairline-border-r',
    tabGap: '',
    // 勿用 flex-1（basis 0）：短标题也会被算成 0 宽再 truncate
    // pe：斜体（preview）末字墨水溢出布局盒，truncate 的 overflow:hidden 会裁半个字符
    tabLabel: 'min-w-0 shrink whitespace-nowrap overflow-hidden text-ellipsis pe-[0.35em]',
    // 选中白底盖住条底 inset 线，与下方 container 内容融合（无分割线）
    tabActive:
      'z-[var(--z-index-above)] bg-[var(--bg-color-container)] text-[var(--text-color-primary)]',
    tabInactive: 'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]',
    closeButton:
      'ml-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[var(--text-color-primary)] opacity-70 transition-[opacity,color] hover:opacity-100 group-hover:opacity-100',
    closeButtonFocus: 'opacity-80',
    closeIcon: 'h-2.5 w-2.5',
  },
}
