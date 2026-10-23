import type { CwDesignInspectorStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const designInspectorBase: CwDesignInspectorStyles = {
  root:
    'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[var(--bg-color-container)]',
  header:
    'flex shrink-0 items-center hairline-border-b border-[var(--border-color)] px-3 py-2',
  headerTitle:
    'text-xs font-medium text-[var(--text-color-primary)]',
  body: 'min-h-0 flex-1 overflow-y-auto',
  section: 'hairline-border-b border-[var(--border-color)]',
  sectionHeader:
    `flex w-full cursor-pointer items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-[var(--bg-color-component-hover)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  sectionHeaderActive: 'bg-[var(--bg-color-page)]',
  sectionLabel: 'flex-1 text-xs font-medium text-[var(--text-color-secondary)]',
  sectionChevron:
    'text-[var(--text-color-placeholder)] transition-transform duration-150 [font-size:10px]',
  sectionBody: 'px-3 pb-3 pt-0',
  empty:
    'px-3 py-6 text-center text-xs text-[var(--text-color-placeholder)]',
}
