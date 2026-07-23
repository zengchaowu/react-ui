import type { CwTreeStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwTreeStyles = {
  root: 'cw-tree outline-none text-[var(--text-color-primary)]',
  node: 'relative',
  nodeContent: 'flex items-center gap-2 cursor-pointer transition-colors hover:bg-[var(--bg-color-component-hover)] outline-none focus:outline-none',
  nodeContentSelected: 'bg-[var(--bg-color-secondarycomponent)] text-[var(--brand-color-primary)] [&_*]:text-[var(--brand-color-primary)]',
  nodeContentHighlighted: 'text-[var(--brand-color-primary)] [&_*]:text-[var(--brand-color-primary)]',
  nodeContentDisabled: 'opacity-50 cursor-not-allowed hover:bg-transparent',
  nodeContentFocused: INTERACTIVE_FOCUS_CLASS,
  nodeLabel: 'min-w-0 flex-1 truncate',
  nodeIcon: 'inline-flex shrink-0 items-center justify-center',
  nodeExtra: 'flex-shrink-0 ml-auto',
  nodeSwitcher: 'flex-shrink-0 flex items-center justify-center cursor-pointer text-[var(--text-color-placeholder)] w-3',
  nodeSwitcherLazyLoading:
    'cursor-default pointer-events-none',
  nodeSwitcherHighlighted: 'text-[var(--brand-color-primary)] [&_*]:text-[var(--brand-color-primary)]',
  nodeSwitcherIcon: '',
  nodeSwitcherExpanded: 'transform rotate-0',
  nodeSwitcherCollapsed: 'transform -rotate-90',
  nodeCheckbox: 'flex-shrink-0 flex items-center self-center',
  // 子节点容器展开/收起动画（CSS Grid: 0fr <-> 1fr）
  nodeChildren: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out',
  nodeChildrenOpen: 'grid-rows-[1fr]',
  nodeChildrenContent: 'overflow-hidden min-h-0',
  line: 'absolute pointer-events-none',
  lineHorizontal: 'hairline-border-t border-[var(--component-border)]',
  lineVertical: 'border-l border-[var(--component-border)]',
  nodeDropBefore:
    'pointer-events-none absolute inset-x-0 top-0 z-[var(--z-index-above)] h-0.5 bg-[var(--brand-color-6)]',
  nodeDropAfter:
    'pointer-events-none absolute inset-x-0 bottom-0 z-[var(--z-index-above)] h-0.5 bg-[var(--brand-color-6)]',
  nodeDropInside:
    'pointer-events-none absolute inset-0 z-[var(--z-index-above)] rounded-sm ring-2 ring-inset ring-[var(--brand-color-6)]',
  // 尺寸样式：小
  sizeSmall: 'text-xs min-h-[1.75rem] py-1 pl-1.5 pr-1.5',
  // 尺寸样式：中
  sizeMedium: 'text-sm min-h-[2.25rem] py-1.5 pl-2 pr-2',
  // 尺寸样式：大
  sizeLarge: 'text-base min-h-[2.75rem] py-2 pl-2.5 pr-2.5'
}
