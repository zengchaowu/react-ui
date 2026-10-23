import type { CwTreeStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** @internal 库内默认 class */
export const treeBase: CwTreeStyles = {
  root: 'cw-tree outline-none text-[var(--text-color-primary)]',
  node: 'relative',
  nodeContent: 'flex items-center cursor-pointer transition-colors hover:bg-[var(--bg-color-component-hover)] outline-none focus:outline-none',
  nodeContentSelected: 'bg-[var(--bg-color-secondarycomponent)] text-[var(--text-color-primary)]',
  nodeContentHighlighted: 'text-[var(--text-color-primary)]',
  nodeContentDisabled: 'opacity-50 cursor-not-allowed hover:bg-transparent',
  nodeContentFocused: INTERACTIVE_FOCUS_CLASS,
  nodeLabel: 'min-w-0 flex-1 truncate',
  /** 根目录等强调行：11px + weight 600 + 大写 */
  nodeLabelStrong:
    'uppercase tracking-wide [font-size:11px] [font-weight:600] leading-snug',
  // empty / :not(:has(*))：无实质图标时不占位
  nodeIcon:
    'inline-flex shrink-0 items-center justify-center empty:hidden [&:not(:has(*))]:hidden',
  nodeExtra: 'flex-shrink-0 ml-auto',
  nodeSwitcher: 'flex-shrink-0 flex items-center justify-center cursor-pointer text-[var(--text-color-primary)] w-3',
  nodeSwitcherLazyLoading:
    'cursor-default pointer-events-none',
  nodeSwitcherHighlighted: 'text-[var(--text-color-primary)]',
  nodeSwitcherIcon: '',
  nodeSwitcherExpanded: 'transform rotate-0',
  nodeSwitcherCollapsed: 'transform -rotate-90',
  nodeCheckbox: 'flex-shrink-0 flex items-center self-center',
  // KEEP CSS grid: 0fr/1fr expand animation (CwGrid is equal-column flex only).
  nodeChildren: 'grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out',
  nodeChildrenOpen: 'grid-rows-[1fr]',
  nodeChildrenContent: 'overflow-hidden min-h-0',
  line: 'absolute pointer-events-none',
  lineHorizontal: 'hairline-border-t border-[var(--border-color)]',
  lineVertical: 'hairline-border-l border-[var(--border-color)]',
  nodeDropBefore:
    'pointer-events-none absolute inset-x-0 top-0 z-[var(--z-index-above)] h-0.5 bg-[var(--brand-color-6)]',
  nodeDropAfter:
    'pointer-events-none absolute inset-x-0 bottom-0 z-[var(--z-index-above)] h-0.5 bg-[var(--brand-color-6)]',
  nodeDropInside:
    'pointer-events-none absolute inset-0 z-[var(--z-index-above)] rounded-sm ring-2 ring-inset ring-[var(--brand-color-6)]',
  // 尺寸样式：小
  sizeSmall: 'gap-1 [font-size:13px] min-h-[1.375rem] py-px pl-1.5 pr-1.5 leading-snug',
  // 尺寸样式：中
  sizeMedium: 'gap-2 text-sm min-h-[2.25rem] py-1.5 pl-2 pr-2',
  // 尺寸样式：大
  sizeLarge: 'gap-2 text-base min-h-[2.75rem] py-2 pl-2.5 pr-2.5',
}
