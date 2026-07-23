import type { CwDataTreeStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwDataTreeStyles = {
  root: 'cw-data-tree outline-none',
  container: 'relative',
  svg: 'absolute top-0 left-0 pointer-events-none',
  node: 'text-sm font-medium text-[var(--text-color-primary)]',
  nodePosition: 'absolute',
  nodeWrapper: 'w-full h-full flex flex-col items-center justify-center cursor-pointer outline-none focus:outline-none',
  nodeContent: 'px-3 py-2 bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-lg shadow-sm hover:shadow-md transition-shadow text-[var(--text-color-primary)]',
  nodeContentFocused: INTERACTIVE_FOCUS_CLASS,
  nodeContentDisabled: 'opacity-50 cursor-not-allowed bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] border-[var(--component-border)]',
  nodeInner: 'flex flex-col items-center justify-center gap-1 w-full h-full',
  nodeText: 'text-center break-words w-full px-2 text-sm font-medium text-[var(--text-color-primary)]',
  line: 'stroke-[var(--text-color-placeholder)]',
  buttonWrapper: 'absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer outline-none focus:outline-none',
  button: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border border-[var(--brand-color-6)] rounded-full shadow-sm transition-colors hover:bg-[var(--brand-color-hover)] hover:shadow-md',
  buttonFocused: INTERACTIVE_FOCUS_CLASS,
  buttonDisabled: 'opacity-50 cursor-not-allowed bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] border-[var(--component-border)]',
  iconCollapsed: 'transform rotate-0',
  iconExpanded: 'transform rotate-180',
  // CwIcon 样式配置（展开/折叠图标）
  iconStyles: {
    root: 'inline-flex items-center justify-center text-[var(--text-color-anti)] transition-transform',
    size: 0.75
  }
}
