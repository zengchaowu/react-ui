import type { CwDesignLayersPanelStyles } from './types'

export const designLayersPanelBase: CwDesignLayersPanelStyles = {
  root:
    'flex h-full min-h-0 w-[15.5rem] shrink-0 flex-col overflow-hidden hairline-border-r border-[var(--border-color)] bg-[var(--bg-color-container)]',
  header:
    'flex shrink-0 items-center justify-between gap-2 hairline-border-b border-[var(--border-color)] px-2 py-1.5',
  headerTitle: 'text-xs font-medium text-[var(--text-color-secondary)]',
  headerActions: 'flex shrink-0 items-center gap-1.5',
  headerMeta:
    'font-normal tabular-nums [font-size:var(--font-size-xs)] text-[var(--text-color-placeholder)]',
  expandToggle:
    'inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-[var(--text-color-placeholder)] transition-colors hover:border-[var(--border-color)] hover:bg-[var(--bg-color-secondarycontainer)] hover:text-[var(--text-color-secondary)] disabled:pointer-events-none disabled:opacity-40',
  search: 'shrink-0 px-2 py-1.5',
  treeWrap: 'min-h-0 flex-1 overflow-auto px-1 py-1',
  empty:
    'px-3 py-4 text-center text-xs text-[var(--text-color-placeholder)]',
  labelText:
    'block min-w-0 flex-1 truncate text-left',
  labelTextHidden: 'opacity-50',
  labelInput: '',
  rowActions: 'inline-flex shrink-0 items-center gap-0.5',
  rowAction:
    'inline-flex h-5 w-5 items-center justify-center rounded text-[var(--text-color-placeholder)] transition-colors hover:bg-[var(--bg-color-secondarycontainer)] hover:text-[var(--text-color-secondary)]',
  rowActionActive: 'text-[var(--text-color-primary)]',
}

/** 嵌入 TpFabric 左栏等场景：无独立侧栏壳、与外层 tabs 共用搜索区 */
export const designLayersPanelEmbeddedPatch: Partial<CwDesignLayersPanelStyles> =
  {
    root:
      'flex min-h-0 w-full flex-1 flex-col overflow-hidden border-0 bg-transparent',
    header:
      'flex shrink-0 items-center justify-between gap-2 px-2 py-1.5',
    search: 'hidden',
  }
