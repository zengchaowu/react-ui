import type { CwDesignLayersPanelStyles } from './types'

export const defaultCwDesignLayersPanelStyles: CwDesignLayersPanelStyles = {
  root:
    'flex h-full min-h-0 w-[15.5rem] shrink-0 flex-col overflow-hidden border-r border-[var(--component-border)] bg-[var(--bg-color-container)]',
  header:
    'flex shrink-0 items-center justify-between gap-2 border-b border-[var(--component-border)] px-2 py-1.5',
  headerTitle: 'text-xs font-medium text-[var(--text-color-secondary)]',
  headerActions: 'flex shrink-0 items-center gap-1.5',
  headerMeta:
    'font-normal tabular-nums [font-size:var(--font-size-xs)] text-[var(--text-color-placeholder)]',
  expandToggle:
    'inline-flex h-6 w-6 items-center justify-center rounded border border-transparent text-[var(--text-color-placeholder)] transition-colors hover:border-[var(--component-border)] hover:bg-[var(--bg-color-secondarycontainer)] hover:text-[var(--text-color-secondary)] disabled:pointer-events-none disabled:opacity-40',
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
