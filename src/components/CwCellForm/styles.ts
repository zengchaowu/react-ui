import type { CwCellFormStyles } from './types'

/** @internal */
export const cellFormBase: CwCellFormStyles = {
  title: 'text-sm font-semibold leading-none text-[var(--text-color-primary)]',
  itemLabelRequired:
    'relative inline-block after:content-["*"] after:absolute after:right-full after:mr-1 after:text-[var(--error-color-6)]',
  /** plain 控件随内容收缩，整体贴右；有 rightAction 时与控件并排 */
  itemContentInner: 'flex w-full min-w-0 items-center justify-end gap-2',
  rightDivider: 'h-4 w-px shrink-0 bg-[var(--bg-color-component)]',
}
